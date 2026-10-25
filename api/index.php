<?php
// Simple PHP Router for /api

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$settingsPath = __DIR__ . '/../settings.json';
$envPath = __DIR__ . '/../.env';

function getSettings() {
    global $settingsPath, $envPath;
    if (file_exists($settingsPath)) {
        $data = file_get_contents($settingsPath);
        $json = json_decode($data, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $json;
        }
    }
    
    // Check inside api directory as fallback
    $localSettingsPath = __DIR__ . '/settings.json';
    if (file_exists($localSettingsPath)) {
        $data = file_get_contents($localSettingsPath);
        $json = json_decode($data, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $json;
        }
    }
    
    // Parse .env as fallback
    $env = [];
    if (file_exists($envPath)) {
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($name, $value) = explode('=', $line, 2);
                $env[trim($name)] = trim($value);
            }
        }
    }
    
    return [
        "razorpayKeyId" => $env["RAZORPAY_KEY_ID"] ?? "rzp_live_T5YEpYQVLQJfpN",
        "razorpayKeySecret" => $env["RAZORPAY_KEY_SECRET"] ?? "54feYtdXQGRcRkCEbEOS07IC",
        "facebookPixelId" => "",
        "googleAnalyticsId" => "",
        "googleAdsId" => "",
        "googleTagManagerId" => ""
    ];
}

function getAllowTestAmount() {
    global $envPath;
    if (file_exists($envPath)) {
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($name, $value) = explode('=', $line, 2);
                if (trim($name) === 'ALLOW_TEST_AMOUNT') {
                    return trim($value) === 'true';
                }
            }
        }
    }
    return false;
}

// Get the request URI
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Routing
if (preg_match('/\/api\/settings$/', $path)) {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $config = getSettings();
        echo json_encode([
            "razorpayKeyId" => $config["razorpayKeyId"],
            "facebookPixelId" => $config["facebookPixelId"] ?? "",
            "googleAnalyticsId" => $config["googleAnalyticsId"] ?? "",
            "googleAdsId" => $config["googleAdsId"] ?? "",
            "googleTagManagerId" => $config["googleTagManagerId"] ?? "",
            "upiId" => $config["upiId"] ?? "paytm.s3wd4g4@pty"
        ]);
        exit;
    }
} elseif (preg_match('/\/api\/admin\/settings$/', $path)) {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $config = getSettings();
        echo json_encode($config);
        exit;
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        $newConfig = [
            "razorpayKeyId" => trim($input["razorpayKeyId"] ?? ""),
            "razorpayKeySecret" => trim($input["razorpayKeySecret"] ?? ""),
            "facebookPixelId" => trim($input["facebookPixelId"] ?? ""),
            "googleAnalyticsId" => trim($input["googleAnalyticsId"] ?? ""),
            "googleAdsId" => trim($input["googleAdsId"] ?? ""),
            "googleTagManagerId" => trim($input["googleTagManagerId"] ?? ""),
            "upiId" => trim($input["upiId"] ?? "paytm.s3wd4g4@pty")
        ];
        $saved = false;
        if (@file_put_contents($settingsPath, json_encode($newConfig, JSON_PRETTY_PRINT)) !== false) {
            $saved = true;
        } else {
            $localSettingsPath = __DIR__ . '/settings.json';
            if (@file_put_contents($localSettingsPath, json_encode($newConfig, JSON_PRETTY_PRINT)) !== false) {
                $saved = true;
            }
        }
        if ($saved) {
            echo json_encode(["success" => true, "message" => "Settings saved successfully", "settings" => $newConfig]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to write settings file"]);
        }
        exit;
    }
} elseif (preg_match('/\/api\/payment\/config$/', $path)) {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        echo json_encode([
            "allowTestAmount" => getAllowTestAmount()
        ]);
        exit;
    }
} elseif (preg_match('/\/api\/payment\/order$/', $path)) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        $cartProducts = $input["cartProducts"] ?? [];
        $origin = $input["origin"] ?? '';
        if (empty($cartProducts)) {
            http_response_code(400);
            echo json_encode(["error" => "Cart is empty"]);
            exit;
        }

        // Use amount sent from React frontend directly (matches working direct payment flow)
        $calculatedTotal = isset($input["amount"]) ? floatval($input["amount"]) : 0;

        $amountInPaise = round($calculatedTotal * 100);
        if ($amountInPaise <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid order amount"]);
            exit;
        }

        $config = getSettings();
        $keyId = $config["razorpayKeyId"];
        $keySecret = $config["razorpayKeySecret"];

        // Call Razorpay Payment Links API (no Composer SDK required)
        $url = 'https://api.razorpay.com/v1/payment_links';
        $receiptId = 'rcpt_' . time();

        // Construct callback URL dynamically targeting the React verify page route
        if (!empty($origin)) {
            $callbackUrl = rtrim($origin, '/') . "/checkout/verify?receipt=" . $receiptId;
        } else {
            $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://');
            $host = $_SERVER['HTTP_HOST'];
            $callbackUrl = $protocol . $host . "/checkout/verify?receipt=" . $receiptId;
        }

        $data = array(
            "amount" => $amountInPaise,
            "currency" => "INR",
            "accept_partial" => false,
            "description" => "Order Payment " . $receiptId,
            "notify" => array(
                "sms" => false,
                "email" => false
            ),
            "reminder_enable" => false,
            "callback_url" => $callbackUrl,
            "callback_method" => "get"
        );

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_USERPWD, "$keyId:$keySecret");
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Disable SSL check for compatibility

        $response = curl_exec($ch);
        
        if ($response === false) {
            $errStr = curl_error($ch);
            curl_close($ch);
            http_response_code(500);
            echo json_encode(["error" => "Connection to Razorpay failed: " . $errStr]);
            exit;
        }

        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $result = json_decode($response, true);

        if (($httpCode == 200 || $httpCode == 201) && isset($result['short_url'])) {
            echo json_encode([
                "success" => true,
                "paymentLink" => $result['short_url']
            ]);
        } else {
            http_response_code($httpCode ?: 500);
            echo json_encode([
                "error" => "Razorpay payment link creation failed",
                "details" => $result ?? $response
            ]);
        }
        exit;
    }
} elseif (preg_match('/\/api\/payment\/verify$/', $path)) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        $razorpayOrderId = $input["razorpay_order_id"] ?? '';
        $razorpayPaymentId = $input["razorpay_payment_id"] ?? '';
        $razorpaySignature = $input["razorpay_signature"] ?? '';

        if (!$razorpayOrderId || !$razorpayPaymentId || !$razorpaySignature) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required parameters"]);
            exit;
        }

        $config = getSettings();
        $secret = $config["razorpayKeySecret"];

        $expectedSignature = hash_hmac("sha256", $razorpayOrderId . "|" . $razorpayPaymentId, $secret);

        if (hash_equals($expectedSignature, $razorpaySignature)) {
            echo json_encode(["success" => true, "message" => "Payment verified successfully"]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Signature verification failed"]);
        }
        exit;
    }
}

// Route not found
http_response_code(404);
echo json_encode(["error" => "Endpoint not found: " . $path]);
?>

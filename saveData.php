
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
// Specify the filename where the data will be saved
$filename = 'data.json';

// Get the JSON input from the POST request
$data = file_get_contents('php://input');

// Check if the data is valid JSON
if (json_decode($data) !== null) {
    // Write the JSON data to the file
    if (file_put_contents($filename, $data)) {
        // Send a success response
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Data saved successfully.']);
    } else {
        // If writing to the file failed, send an error response
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to save data.']);
    }
} else {
    // If the input is not valid JSON, send an error response
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON data.']);
}
?>

<?php
require('vendor/autoload.php');

$services_json  = json_decode(getenv('VCAP_SERVICES'),true);
$env            = $services_json['cloudantNoSQLDB'][0]['credentials']; 
$username       = $env['username'];
$password       = $env['password'];

// Extract the temperature and room source
$location       = $_POST['loc'];
$capacity       = $_POST['cap'];
$temperature    = $_POST['tmp'];
$humidity       = $_POST['hmd'];
$heatindex      = $_POST['hin'];
$decibels       = $_POST['dec'];
 
try {
  $sag = new Sag($username . '.cloudant.com');
  $sag->login($username, $password);
  $sag->setDatabase('room');
  $result = $sag->put(uniqid(), array(
      'location'      => $location, 
      'capacity'      => $capacity, 
      'temperature'   => $temperature, 
      'humidity'      => $humidity, 
      'heatindex'     => $heatindex, 
      'decibels'      => $decibels, 
      'timestamp'     => time()
    )
  );
  echo($result->body->id);
} catch(Exception $e) {
  echo '<p>Database connection error:</p>';
  echo $e->getMessage();
}
<?php
require 'vendor/autoload.php';
require 'bluemix-config.php';

$client = new GuzzleHttp\Client();

$res = $client->request('POST', "https://openwhisk.ng.bluemix.net/api/v1/namespaces/$namespace/actions/tweet-fetch", [
    'blocking' => 'true',
    'headers' => [
        'User-Agent'      => 'incoming.php/1.0',
        'Authorization'   => "Basic $authorization"
    ]
]);
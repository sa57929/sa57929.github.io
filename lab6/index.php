<?php

require __DIR__ . '/autoload.php';

use App\Encoder\CsvEncoder;
use App\Encoder\JsonEncoder;
use App\Encoder\YamlEncoder;
use App\Serializer;

$formats = [
    'csv' => 'CSV',
    'ssv' => 'SSV',
    'tsv' => 'TSV',
    'json' => 'JSON',
    'yaml' => 'YAML',
];

$inputData = $_COOKIE['input_data'] ?? '';
$inputFormat = $_COOKIE['input_format'] ?? 'csv';
$outputFormat = $_COOKIE['output_format'] ?? 'json';
$outputData = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputData = $_POST['input_data'] ?? '';
    $inputFormat = $_POST['input_format'] ?? 'csv';
    $outputFormat = $_POST['output_format'] ?? 'json';

    setcookie('input_data', $inputData, time() + 3600 * 24 * 30);
    setcookie('input_format', $inputFormat, time() + 3600 * 24 * 30);
    setcookie('output_format', $outputFormat, time() + 3600 * 24 * 30);

    $serializer = new Serializer([
        new CsvEncoder(),
        new JsonEncoder(),
        new YamlEncoder(),
    ]);

    $outputData = $serializer->convert(
        $inputData,
        $inputFormat,
        $outputFormat
    );
}

require __DIR__ . '/templates/layout.php';

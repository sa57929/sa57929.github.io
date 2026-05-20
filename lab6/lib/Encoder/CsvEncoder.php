<?php

namespace App\Encoder;

class CsvEncoder implements EncoderInterface
{
    private const DELIMITERS = [
        'csv' => ',',
        'ssv' => ';',
        'tsv' => "\t",
    ];

    public function supports(string $format): bool
    {
        return isset(self::DELIMITERS[$format]);
    }

    public function decode(string $input, string $format): array
    {
        $delimiter = self::DELIMITERS[$format];
        $lines = preg_split('/\R/', trim($input));

        if (!$lines || count($lines) < 2) {
            return [];
        }
        $headers = str_getcsv(array_shift($lines), $delimiter, '"', '');
        $result = [];
        foreach ($lines as $line) {
            if (trim($line) === '') {
                continue;
            }

            $values = str_getcsv($line, $delimiter, '"', '');
            $row = [];

            foreach ($headers as $index => $header) {
                $row[$header] = $this->castValue($values[$index]);
            }
            $result[] = $row;
        }

        return $result;
    }

    public function encode(array $data, string $format): string
    {
        if ($data === []) {
            return '';
        }
        $delimiter = self::DELIMITERS[$format];

        $headers = array_keys($data[0]);

        $lines = [];
        $lines[] = implode($delimiter, $headers);

        foreach ($data as $row) {
            $values = [];
            foreach ($headers as $header) {
                $values[] = (string) ($row[$header] ?? '');
            }
            $lines[] = implode($delimiter, $values);
        }

        return implode(PHP_EOL, $lines);
    }

    private function castValue(string $value): mixed
    {
        $value = trim($value);

        if (is_numeric($value)) {
            return str_contains($value, '.')
                ? (float) $value
                : (int) $value;
        }

        return $value;
    }
}
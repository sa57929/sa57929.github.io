<?php

namespace App\Encoder;

use RuntimeException;

class JsonEncoder implements EncoderInterface
{
    public function supports(string $format): bool
    {
        return $format === 'json';
    }

    public function decode(string $input, string $format): array
    
    {
        $data = json_decode($input, true);

        return $data;
    }

    public function encode(array $data, string $format): string
    {
        return json_encode(
            $data,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
        );
    }
}
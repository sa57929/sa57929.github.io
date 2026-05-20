<?php

namespace App\Encoder;

use RuntimeException;

class YamlEncoder implements EncoderInterface
{
    public function supports(string $format): bool
    {
        return $format === 'yaml';
    }

    public function decode(string $input, string $format): array
    {
        $data = yaml_parse($input);

        return $data;
    }

    public function encode(array $data, string $format): string
    {
        return yaml_emit($data, YAML_UTF8_ENCODING);
    }
}

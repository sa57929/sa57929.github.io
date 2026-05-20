<?php

namespace App;

use App\Encoder\EncoderInterface;
use RuntimeException;

class Serializer
{
    public function __construct(
        private array $encoders
    ) {
    }

    public function convert(string $input, string $inputFormat, string $outputFormat): string
    {
        if ($inputFormat === $outputFormat) {
            return $input;
        }

        $decoder = $this->getEncoder($inputFormat);
        $encoder = $this->getEncoder($outputFormat);
        $data = $decoder->decode($input, $inputFormat);
        
        return $encoder->encode($data, $outputFormat);
    }

    private function getEncoder(string $format): EncoderInterface
    {
        foreach ($this->encoders as $encoder) {
            if ($encoder->supports($format)) {
                return $encoder;
            }
        }
    }
}

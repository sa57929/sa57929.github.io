<?php

namespace App\Entity;

use App\Repository\RazorRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RazorRepository::class)]
class Razor
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $size = null;

    #[ORM\Column(length: 255)]
    private ?string $sharpness = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getSize(): ?int
    {
        return $this->size;
    }

    public function setSize(int $size): static
    {
        $this->size = $size;

        return $this;
    }

    public function getSharpness(): ?string
    {
        return $this->sharpness;
    }

    public function setSharpness(string $sharpness): static
    {
        $this->sharpness = $sharpness;

        return $this;
    }
}

<?php

namespace App\Model;

use App\Service\Config;

class Syringe
{
    private ?int $id = null;
    private ?string $name = null;
    private ?int $capacityMl = null;
    private ?string $needleSize = null;
    private ?string $description = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): Syringe
    {
        $this->id = $id;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): Syringe
    {
        $this->name = $name;

        return $this;
    }

    public function getCapacityMl(): ?int
    {
        return $this->capacityMl;
    }

    public function setCapacityMl(?int $capacityMl): Syringe
    {
        $this->capacityMl = $capacityMl;

        return $this;
    }

    public function getNeedleSize(): ?string
    {
        return $this->needleSize;
    }

    public function setNeedleSize(?string $needleSize): Syringe
    {
        $this->needleSize = $needleSize;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): Syringe
    {
        $this->description = $description;

        return $this;
    }

    public static function fromArray($array): Syringe
    {
        $syringe = new self();
        $syringe->fill($array);

        return $syringe;
    }

    public function fill($array): Syringe
    {
        if (isset($array['id']) && !$this->getId()) {
            $this->setId((int) $array['id']);
        }
        if (isset($array['name'])) {
            $this->setName($array['name']);
        }
        if (isset($array['capacity_ml'])) {
            $this->setCapacityMl((int) $array['capacity_ml']);
        }
        if (isset($array['needle_size'])) {
            $this->setNeedleSize($array['needle_size']);
        }
        if (isset($array['description'])) {
            $this->setDescription($array['description']);
        }

        return $this;
    }

    public static function findAll(): array
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = 'SELECT * FROM syringe';
        $statement = $pdo->prepare($sql);
        $statement->execute();

        $syringes = [];
        $syringesArray = $statement->fetchAll(\PDO::FETCH_ASSOC);
        foreach ($syringesArray as $syringeArray) {
            $syringes[] = self::fromArray($syringeArray);
        }

        return $syringes;
    }

    public static function find($id): ?Syringe
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = 'SELECT * FROM syringe WHERE id = :id';
        $statement = $pdo->prepare($sql);
        $statement->execute(['id' => $id]);

        $syringeArray = $statement->fetch(\PDO::FETCH_ASSOC);
        if (!$syringeArray) {
            return null;
        }

        return Syringe::fromArray($syringeArray);
    }

    public function save(): void
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        if (!$this->getId()) {
            $sql = 'INSERT INTO syringe (name, capacity_ml, needle_size, description) VALUES (:name, :capacity_ml, :needle_size, :description)';
            $statement = $pdo->prepare($sql);
            $statement->execute([
                'name' => $this->getName(),
                'capacity_ml' => $this->getCapacityMl(),
                'needle_size' => $this->getNeedleSize(),
                'description' => $this->getDescription(),
            ]);

            $this->setId((int) $pdo->lastInsertId());
        } else {
            $sql = 'UPDATE syringe SET name = :name, capacity_ml = :capacity_ml, needle_size = :needle_size, description = :description WHERE id = :id';
            $statement = $pdo->prepare($sql);
            $statement->execute([
                ':name' => $this->getName(),
                ':capacity_ml' => $this->getCapacityMl(),
                ':needle_size' => $this->getNeedleSize(),
                ':description' => $this->getDescription(),
                ':id' => $this->getId(),
            ]);
        }
    }

    public function delete(): void
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = 'DELETE FROM syringe WHERE id = :id';
        $statement = $pdo->prepare($sql);
        $statement->execute([
            ':id' => $this->getId(),
        ]);

        $this->setId(null);
        $this->setName(null);
        $this->setCapacityMl(null);
        $this->setNeedleSize(null);
        $this->setDescription(null);
    }
}

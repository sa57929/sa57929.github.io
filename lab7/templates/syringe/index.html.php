<?php

/** @var \App\Model\Syringe[] $syringes */
/** @var \App\Service\Router $router */

$title = 'Instrumentorium';
$bodyClass = 'index';

ob_start(); ?>
<h1>Instrument List</h1>

<a href="<?= $router->generatePath('syringe-create') ?>">Create Tool</a>

<ul class="index-list">
    <?php foreach ($syringes as $syringe) : ?>
        <li>
            <h3><?= htmlspecialchars($syringe->getName() ?? '') ?></h3>
            <p>
                Capacity: <?= htmlspecialchars($syringe->getCapacityMl() ?? '') ?> ml,
                the Needle: <?= htmlspecialchars($syringe->getNeedleSize() ?? '') ?>
            </p>
            <ul class="action-list">
                <li><a href="<?= $router->generatePath('syringe-show', ['id' => $syringe->getId()]) ?>">Further information</a></li>
                <li><a href="<?= $router->generatePath('syringe-edit', ['id' => $syringe->getId()]) ?>">Adjust</a></li>
            </ul>
        </li>
    <?php endforeach; ?>
</ul>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';

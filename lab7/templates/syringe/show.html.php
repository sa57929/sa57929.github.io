<?php

/** @var \App\Model\Syringe $syringe */
/** @var \App\Service\Router $router */

$title = "{$syringe->getName()} ({$syringe->getId()})";
$bodyClass = 'show';

ob_start(); ?>
<h1><?= htmlspecialchars($syringe->getName() ?? '') ?></h1>

<article>
    <p><strong>Capacity:</strong> <?= htmlspecialchars($syringe->getCapacityMl() ?? '') ?> ml</p>
    <p><strong>Calibre of the Needle:</strong> <?= htmlspecialchars($syringe->getNeedleSize() ?? '') ?></p>
    <p><strong>Inscryption:</strong></p>
    <p><?= nl2br(htmlspecialchars($syringe->getDescription() ?? '')) ?></p>
</article>

<ul class="action-list">
    <li><a href="<?= $router->generatePath('syringe-index') ?>">Return to your instruments</a></li>
    <li><a href="<?= $router->generatePath('syringe-edit', ['id' => $syringe->getId()]) ?>">Adjust</a></li>
</ul>
<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';

<?php

/** @var \App\Model\Syringe $syringe */
/** @var \App\Service\Router $router */

$title = "Adjust Instrument {$syringe->getName()} ({$syringe->getId()})";
$bodyClass = 'edit';

ob_start(); ?>
<h1><?= htmlspecialchars($title) ?></h1>
<form action="<?= $router->generatePath('syringe-edit') ?>" method="post" class="edit-form">
    <?php require __DIR__ . DIRECTORY_SEPARATOR . '_form.html.php'; ?>
    <input type="hidden" name="action" value="syringe-edit">
    <input type="hidden" name="id" value="<?= $syringe->getId() ?>">
</form>

<ul class="action-list">
    <li><a href="<?= $router->generatePath('syringe-index') ?>">Return to toolbox</a></li>
    <li>
        <form action="<?= $router->generatePath('syringe-delete') ?>" method="post">
            <input type="submit" value="Delete" onclick="return confirm('Do you wish?')">
            <input type="hidden" name="action" value="syringe-delete">
            <input type="hidden" name="id" value="<?= $syringe->getId() ?>">
        </form>
    </li>
</ul>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';

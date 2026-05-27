<?php

/** @var \App\Model\Syringe $syringe */
/** @var \App\Service\Router $router */

$title = 'Create Syringe';
$bodyClass = 'edit';

ob_start(); ?>
<h1>Create the tool</h1>
<form action="<?= $router->generatePath('syringe-create') ?>" method="post" class="edit-form">
    <?php require __DIR__ . DIRECTORY_SEPARATOR . '_form.html.php'; ?>
    <input type="hidden" name="action" value="syringe-create">
</form>

<a href="<?= $router->generatePath('syringe-index') ?>">Back to list</a>
<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';

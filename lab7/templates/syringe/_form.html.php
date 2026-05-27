<?php
    /** @var $syringe ?\App\Model\Syringe */
?>

<div class="form-group">
    <label for="name">Label</label>
    <input type="text" id="name" name="syringe[name]" value="<?= htmlspecialchars($syringe ? $syringe->getName() ?? '' : '') ?>">
</div>

<div class="form-group">
    <label for="capacity_ml">Capacity [ml]</label>
    <input type="number" id="capacity_ml" name="syringe[capacity_ml]" value="<?= htmlspecialchars($syringe ? $syringe->getCapacityMl() ?? '' : '') ?>">
</div>

<div class="form-group">
    <label for="needle_size">Needle size</label>
    <input type="text" id="needle_size" name="syringe[needle_size]" value="<?= htmlspecialchars($syringe ? $syringe->getNeedleSize() ?? '' : '') ?>">
</div>

<div class="form-group">
    <label for="description">Inscryption</label>
    <textarea id="description" name="syringe[description]"><?= htmlspecialchars($syringe ? $syringe->getDescription() ?? '' : '') ?></textarea>
</div>

<div class="form-group">
    <label></label>
    <input type="submit" value="Submit">
</div>
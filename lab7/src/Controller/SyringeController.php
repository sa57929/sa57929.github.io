<?php
namespace App\Controller;

use App\Exception\NotFoundException;
use App\Model\Syringe;
use App\Service\Router;
use App\Service\Templating;

class SyringeController
{
    public function indexAction(Templating $templating, Router $router): ?string
    {
        $syringes = Syringe::findAll();
        $html = $templating->render('syringe/index.html.php', [
            'syringes' => $syringes,
            'router' => $router,
        ]);
        return $html;
    }

    public function createAction(?array $requestSyringe, Templating $templating, Router $router): ?string
    {
        if ($requestSyringe) {
            $syringe = Syringe::fromArray($requestSyringe);
            $syringe->save();

            $path = $router->generatePath('syringe-index');
            $router->redirect($path);
            return null;
        } else {
            $syringe = new Syringe();
        }

        $html = $templating->render('syringe/create.html.php', [
            'syringe' => $syringe,
            'router' => $router,
        ]);
        return $html;
    }

    public function editAction(int $syringeId, ?array $requestSyringe, Templating $templating, Router $router): ?string
    {
        $syringe = Syringe::find($syringeId);
        if (! $syringe) {
            throw new NotFoundException("Missing syringe with id $syringeId");
        }

        if ($requestSyringe) {
            $syringe->fill($requestSyringe);
            $syringe->save();

            $path = $router->generatePath('syringe-index');
            $router->redirect($path);
            return null;
        }

        $html = $templating->render('syringe/edit.html.php', [
            'syringe' => $syringe,
            'router' => $router,
        ]);
        return $html;
    }

    public function showAction(int $syringeId, Templating $templating, Router $router): ?string
    {
        $syringe = Syringe::find($syringeId);
        if (! $syringe) {
            throw new NotFoundException("Missing syringe with id $syringeId");
        }

        $html = $templating->render('syringe/show.html.php', [
            'syringe' => $syringe,
            'router' => $router,
        ]);
        return $html;
    }

    public function deleteAction(int $syringeId, Router $router): ?string
    {
        $syringe = Syringe::find($syringeId);
        if (! $syringe) {
            throw new NotFoundException("Missing syringe with id $syringeId");
        }

        $syringe->delete();
        $path = $router->generatePath('syringe-index');
        $router->redirect($path);
        return null;
    }
}
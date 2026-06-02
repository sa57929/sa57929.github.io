<?php

namespace App\Controller;

use App\Entity\Syringe;
use App\Form\SyringeType;
use App\Repository\SyringeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/syringe')]
final class SyringeController extends AbstractController
{
    #[Route(name: 'app_syringe_index', methods: ['GET'])]
    public function index(SyringeRepository $syringeRepository): Response
    {
        return $this->render('syringe/index.html.twig', [
            'syringes' => $syringeRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'app_syringe_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $syringe = new Syringe();
        $form = $this->createForm(SyringeType::class, $syringe);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($syringe);
            $entityManager->flush();

            return $this->redirectToRoute('app_syringe_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('syringe/new.html.twig', [
            'syringe' => $syringe,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_syringe_show', methods: ['GET'])]
    public function show(Syringe $syringe): Response
    {
        return $this->render('syringe/show.html.twig', [
            'syringe' => $syringe,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_syringe_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Syringe $syringe, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(SyringeType::class, $syringe);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            return $this->redirectToRoute('app_syringe_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('syringe/edit.html.twig', [
            'syringe' => $syringe,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_syringe_delete', methods: ['POST'])]
    public function delete(Request $request, Syringe $syringe, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$syringe->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($syringe);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_syringe_index', [], Response::HTTP_SEE_OTHER);
    }
}

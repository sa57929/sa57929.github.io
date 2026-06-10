var express = require("express");
var router = express.Router();
var db = require("../db");

function getSyringeOr404(id, res) {
  const syringe = db.prepare("SELECT * FROM syringe WHERE id = ?").get(id);

  if (!syringe) {
    res.status(404).render("error", {
      message: "Nie znaleziono strzykawki",
      error: { status: 404, stack: "" },
    });
    return null;
  }

  return syringe;
}

router.get("/", function (req, res, next) {
  try {
    const syringes = db.prepare("SELECT * FROM syringe ORDER BY id").all();
    res.render("syringe/index", { title: "Lista strzykawek", syringes });
  } catch (err) {
    next(err);
  }
});

router.get("/new", function (req, res) {
  res.render("syringe/new", {
    title: "Dodaj strzykawkę",
    syringe: { capacity: "", name: "", size: "", description: "" },
  });
});

router.post("/new", function (req, res, next) {
  try {
    const { capacity, name, size, description } = req.body;

    db.prepare(
      "INSERT INTO syringe (capacity, name, size, description) VALUES (?, ?, ?, ?)"
    ).run(Number(capacity), name, size, description || null);

    res.redirect("/syringe");
  } catch (err) {
    next(err);
  }
});

router.get("/:id", function (req, res) {
  const syringe = getSyringeOr404(req.params.id, res);

  if (syringe) {
    res.render("syringe/show", { title: "Szczegóły strzykawki", syringe });
  }
});

router.get("/:id/edit", function (req, res) {
  const syringe = getSyringeOr404(req.params.id, res);

  if (syringe) {
    res.render("syringe/edit", { title: "Edytuj strzykawkę", syringe });
  }
});

router.post("/:id/edit", function (req, res, next) {
  try {
    const { capacity, name, size, description } = req.body;

    db.prepare(
      "UPDATE syringe SET capacity = ?, name = ?, size = ?, description = ? WHERE id = ?"
    ).run(Number(capacity), name, size, description || null, req.params.id);

    res.redirect("/syringe/" + req.params.id);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/delete", function (req, res, next) {
  try {
    db.prepare("DELETE FROM syringe WHERE id = ?").run(req.params.id);
    res.redirect("/syringe");
  } catch (err) {
    next(err);
  }
});

module.exports = router;

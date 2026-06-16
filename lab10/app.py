from pathlib import Path
import sqlite3

from flask import (
    Flask,
    abort,
    redirect,
    render_template,
    request,
    url_for,
)

app = Flask(__name__)

DATABASE_PATH = Path(__file__).with_name("data.db")


def get_db():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def get_syringe_or_404(syringe_id):
    connection = get_db()

    syringe = connection.execute(
        "select * from syringe where id = ?",
        (syringe_id,),
    ).fetchone()

    connection.close()

    if syringe is None:
        abort(404)

    return dict(syringe)


def read_syringe_form():
    syringe = {
        "name": request.form.get("name", "").strip(),
        "capacity_ml": request.form.get("capacity_ml", "").strip(),
        "needle_size": request.form.get("needle_size", "").strip(),
        "description": request.form.get("description", "").strip(),
    }

    if not all(syringe.values()):
        return syringe, "All must be filled."

    return syringe, None


@app.route("/")
def home():
    return redirect(url_for("syringe_index"))


@app.get("/syringes")
def syringe_index():
    connection = get_db()

    rows = connection.execute(
        "select * from syringe order by id"
    ).fetchall()

    connection.close()

    syringes = [dict(row) for row in rows]

    return render_template(
        "syringe/index.html",
        syringes=syringes,
    )


@app.get("/syringes/<int:syringe_id>")
def syringe_show(syringe_id):
    syringe = get_syringe_or_404(syringe_id)

    return render_template(
        "syringe/show.html",
        syringe=syringe,
    )


@app.route("/syringes/create", methods=["GET", "POST"])
def syringe_create():
    syringe = {
        "name": "",
        "capacity_ml": "",
        "needle_size": "",
        "description": "",
    }

    error = None

    if request.method == "POST":
        syringe, error = read_syringe_form()

        if error is None:
            connection = get_db()

            connection.execute(
                """
                insert into syringe (
                    name,
                    capacity_ml,
                    needle_size,
                    description
                )
                values (?, ?, ?, ?)
                """,
                (
                    syringe["name"],
                    syringe["capacity_ml"],
                    syringe["needle_size"],
                    syringe["description"],
                ),
            )

            connection.commit()
            connection.close()

            return redirect(url_for("syringe_index"))

    return render_template(
        "syringe/create.html",
        syringe=syringe,
        error=error,
    )


@app.route(
    "/syringes/<int:syringe_id>/edit",
    methods=["GET", "POST"],
)
def syringe_edit(syringe_id):
    syringe = get_syringe_or_404(syringe_id)
    error = None

    if request.method == "POST":
        syringe, error = read_syringe_form()
        syringe["id"] = syringe_id

        if error is None:
            connection = get_db()

            connection.execute(
                """
                update syringe
                set name = ?,
                    capacity_ml = ?,
                    needle_size = ?,
                    description = ?
                where id = ?
                """,
                (
                    syringe["name"],
                    syringe["capacity_ml"],
                    syringe["needle_size"],
                    syringe["description"],
                    syringe_id,
                ),
            )

            connection.commit()
            connection.close()

            return redirect(
                url_for(
                    "syringe_show",
                    syringe_id=syringe_id,
                )
            )

    return render_template(
        "syringe/edit.html",
        syringe=syringe,
        error=error,
    )


@app.post("/syringes/<int:syringe_id>/delete")
def syringe_delete(syringe_id):
    get_syringe_or_404(syringe_id)

    connection = get_db()

    connection.execute(
        "delete from syringe where id = ?",
        (syringe_id,),
    )

    connection.commit()
    connection.close()

    return redirect(url_for("syringe_index"))


if __name__ == "__main__":
    app.run(debug=True, port=57929)
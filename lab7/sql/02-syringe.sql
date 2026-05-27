create table syringe
(
    id          integer not null
        constraint syringe_pk
            primary key autoincrement,
    name        text    not null,
    capacity_ml integer not null,
    needle_size text    not null,
    description text    not null
);
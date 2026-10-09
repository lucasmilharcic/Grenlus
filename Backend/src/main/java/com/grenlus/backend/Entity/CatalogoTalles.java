package com.grenlus.backend.Entity;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/*
 * Todos los talles que el sistema conoce.
 *
 * Cada producto elige cuales ofrece; esta lista existe
 * para que el panel y el backend hablen de los mismos
 * nombres y en el mismo orden.
 */
public final class CatalogoTalles {

    public static final List<String> INFANTILES =
            List.of("4", "6", "8", "10", "12", "14", "16", "18");

    public static final List<String> ESPECIALES =
            List.of("T6", "T8", "T10", "T14", "T16");

    public static final List<String> ADULTOS =
            List.of("S", "M", "L", "XL", "XXL");

    private static final List<String> TODOS = new ArrayList<>();

    static {
        TODOS.addAll(INFANTILES);
        TODOS.addAll(ESPECIALES);
        TODOS.addAll(ADULTOS);
    }

    private CatalogoTalles() {
    }

    public static List<String> todos() {
        return List.copyOf(TODOS);
    }

    public static String normalizar(String talle) {

        if (talle == null) {
            return null;
        }

        String limpio = talle.trim().toUpperCase();

        return limpio.isEmpty()
                ? null
                : limpio;
    }

    public static boolean existe(String talle) {

        String normalizado = normalizar(talle);

        return normalizado != null
                && TODOS.contains(normalizado);
    }

    public static boolean esEspecial(String talle) {

        String normalizado = normalizar(talle);

        return normalizado != null
                && ESPECIALES.contains(normalizado);
    }

    /*
     * Deja los talles en el orden del catalogo y descarta
     * los que no existen.
     */
    public static Set<String> ordenar(
            java.util.Collection<String> talles) {

        Set<String> ordenados = new LinkedHashSet<>();

        if (talles == null) {
            return ordenados;
        }

        Set<String> pedidos = new LinkedHashSet<>();

        for (String talle : talles) {

            String normalizado = normalizar(talle);

            if (normalizado != null) {
                pedidos.add(normalizado);
            }
        }

        for (String talle : TODOS) {

            if (pedidos.contains(talle)) {
                ordenados.add(talle);
            }
        }

        return ordenados;
    }
}

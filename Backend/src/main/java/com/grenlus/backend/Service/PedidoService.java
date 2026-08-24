package com.grenlus.backend.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grenlus.backend.DTO.CreatePedidoDTO;
import com.grenlus.backend.DTO.DetallePedidoDTO;
import com.grenlus.backend.DTO.DetallePedidoResponseDTO;
import com.grenlus.backend.DTO.DisenoPedidoDTO;
import com.grenlus.backend.DTO.DisenoPedidoResponseDTO;
import com.grenlus.backend.DTO.PedidoResponseDTO;

import com.grenlus.backend.Entity.AreaPersonalizacion;
import com.grenlus.backend.Entity.Carteleria;
import com.grenlus.backend.Entity.DetallePedido;
import com.grenlus.backend.Entity.DisenoPedido;
import com.grenlus.backend.Entity.Indumentaria;
import com.grenlus.backend.Entity.EstadoEnvio;
import com.grenlus.backend.Entity.MetodoEntrega;
import com.grenlus.backend.Entity.Pedido;
import com.grenlus.backend.Entity.Producto;
import com.grenlus.backend.Entity.TamanoEstampa;
import com.grenlus.backend.Entity.TarifaEnvio;
import com.grenlus.backend.Entity.Usuario;
import com.grenlus.backend.Repository.UsuarioRepository;

import com.grenlus.backend.Exception.BadRequestException;
import com.grenlus.backend.Exception.ResourceNotFoundException;

import com.grenlus.backend.Repository.AreaPersonalizacionRepository;
import com.grenlus.backend.Repository.PedidoRepository;
import com.grenlus.backend.Repository.ProductoRepository;

@Service
public class PedidoService {

        private final PedidoRepository pedidoRepository;

        private final ProductoRepository productoRepository;

        private final AreaPersonalizacionRepository areaRepository;

        private final UsuarioRepository usuarioRepository;

        private final EnvioService envioService;

        public PedidoService(
                        PedidoRepository pedidoRepository,
                        ProductoRepository productoRepository,
                        AreaPersonalizacionRepository areaRepository,
                        UsuarioRepository usuarioRepository,
                        EnvioService envioService) {

                this.pedidoRepository = pedidoRepository;

                this.productoRepository = productoRepository;

                this.areaRepository = areaRepository;

                this.usuarioRepository = usuarioRepository;

                this.envioService = envioService;
        }

        // =========================================================
        // CREAR PEDIDO
        // =========================================================

        @Transactional
        public PedidoResponseDTO crearPedido(
                        CreatePedidoDTO dto,
                        String username) {

                validarPedido(dto);

                Pedido pedido = new Pedido();

                // =====================================================
                // USUARIO LOGUEADO
                // =====================================================

                if (username != null &&
                                !username.isBlank() &&
                                !"anonymousUser".equalsIgnoreCase(username)) {

                        Usuario usuario = usuarioRepository
                                        .findByUsername(username)
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Usuario no encontrado"));

                        pedido.setUsuario(usuario);
                }

                // =====================================================
                // CLIENTE
                // =====================================================

                pedido.setNombreCliente(
                                limpiarTexto(dto.getNombreCliente()));

                pedido.setTelefono(
                                limpiarTexto(dto.getTelefono()));

                pedido.setEmail(
                                limpiarTexto(dto.getEmail()));

                pedido.setDireccion(
                                limpiarTexto(dto.getDireccion()));

                pedido.setCiudad(
                                limpiarTexto(dto.getCiudad()));

                pedido.setProvincia(
                                limpiarTexto(dto.getProvincia()));

                pedido.setCodigoPostal(
                                limpiarTexto(dto.getCodigoPostal()));

                // =====================================================
                // PAGO
                // =====================================================

                if (dto.getMetodoPago() == null) {

                        throw new BadRequestException(
                                        "Debés seleccionar un medio de pago.");
                }

                pedido.setMetodoPago(dto.getMetodoPago());

                // =====================================================
                // PRODUCTOS
                // =====================================================

                BigDecimal subtotalProductos = BigDecimal.ZERO;

                for (DetallePedidoDTO detalleDTO : dto.getDetalles()) {

                        DetallePedido detalle = crearDetalle(detalleDTO);

                        pedido.agregarDetalle(detalle);

                        subtotalProductos = subtotalProductos.add(
                                        detalle.getSubtotal());
                }

                pedido.setSubtotalProductos(subtotalProductos);

                // =====================================================
                // ENTREGA
                // =====================================================

                MetodoEntrega metodoEntrega = dto.getMetodoEntrega();

                if (metodoEntrega == null) {

                        throw new BadRequestException(
                                        "Debés seleccionar una forma de entrega.");
                }

                pedido.setMetodoEntrega(metodoEntrega);

                BigDecimal costoEnvio = BigDecimal.ZERO;

                if (metodoEntrega == MetodoEntrega.RETIRO) {

                        pedido.setTarifaEnvio(null);
                        pedido.setCostoEnvio(BigDecimal.ZERO);
                        pedido.setEstadoEnvio(EstadoEnvio.NO_CORRESPONDE);

                } else if (metodoEntrega == MetodoEntrega.ENVIO_DOMICILIO) {

                        validarProductosParaEnvio(pedido);
                        validarDatosEnvio(dto);

                        if (dto.getTarifaEnvioId() == null) {

                                throw new BadRequestException(
                                                "Debés seleccionar una tarifa de envío.");
                        }

                        TarifaEnvio tarifa = envioService.obtenerTarifa(
                                        dto.getTarifaEnvioId());

                        costoEnvio = normalizarPrecio(
                                        tarifa.getPrecio());

                        pedido.setTarifaEnvio(tarifa);
                        pedido.setCostoEnvio(costoEnvio);
                        pedido.setEstadoEnvio(EstadoEnvio.PENDIENTE);

                } else if (metodoEntrega == MetodoEntrega.COORDINAR) {

                        pedido.setTarifaEnvio(null);
                        pedido.setCostoEnvio(BigDecimal.ZERO);
                        pedido.setEstadoEnvio(EstadoEnvio.NO_CORRESPONDE);

                } else {

                        throw new BadRequestException(
                                        "Método de entrega inválido.");
                }

                // =====================================================
                // TOTAL FINAL
                // =====================================================

                BigDecimal totalFinal = subtotalProductos.add(costoEnvio);

                pedido.setTotal(totalFinal);

                // =====================================================
                // GUARDAR
                // =====================================================

                Pedido guardado = pedidoRepository.save(pedido);

                return convertirADTO(guardado);
        }

        // =========================================================
        // CREAR DETALLE
        // =========================================================

        private DetallePedido crearDetalle(
                        DetallePedidoDTO detalleDTO) {

                validarDetalle(
                                detalleDTO);

                Producto producto = productoRepository
                                .findById(
                                                detalleDTO.getProductoId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Producto no encontrado: "
                                                                + detalleDTO.getProductoId()));

                if (!producto.isActivo()) {

                        throw new BadRequestException(
                                        "El producto \""
                                                        + producto.getNombre()
                                                        + "\" no está disponible.");
                }

                /*
                 * Cartelería a cotizar jamás entra
                 * en pedido/carrito.
                 */
                if (producto instanceof Carteleria carteleria) {

                        if (carteleria.isEsCotizable()) {

                                throw new BadRequestException(
                                                "El producto \""
                                                                + producto.getNombre()
                                                                + "\" requiere cotización y no puede agregarse al carrito.");
                        }
                }

                DetallePedido detalle = new DetallePedido();

                detalle.setProducto(
                                producto);

                detalle.setCantidad(
                                detalleDTO.getCantidad());

                detalle.setTalle(
                                limpiarTexto(
                                                detalleDTO.getTalle()));

                detalle.setColor(
                                limpiarTexto(
                                                detalleDTO.getColor()));

                /*
                 * PRECIO.
                 *
                 * Siempre sale de la base de datos.
                 */
                BigDecimal precioBase = obtenerPrecioBase(
                                producto);

                TamanoEstampa tamanoEstampa = obtenerTamanoEstampa(
                                detalleDTO);

                BigDecimal precioEstampa = calcularPrecioEstampa(
                                producto,
                                tamanoEstampa);

                BigDecimal precioUnitario = precioBase.add(
                                precioEstampa);

                BigDecimal subtotal = precioUnitario.multiply(
                                BigDecimal.valueOf(
                                                detalleDTO
                                                                .getCantidad()));

                detalle.setPrecioBase(
                                precioBase);

                detalle.setPrecioEstampa(
                                precioEstampa);

                detalle.setPrecioUnitario(
                                precioUnitario);

                detalle.setSubtotal(
                                subtotal);

                detalle.setTamanoEstampa(
                                tamanoEstampa);

                // =====================================================
                // DISEÑOS
                // =====================================================

                if (detalleDTO.getDisenos() != null) {

                        for (DisenoPedidoDTO disenoDTO : detalleDTO.getDisenos()) {

                                /*
                                 * IMPORTANTE:
                                 *
                                 * Ahora también enviamos el COLOR elegido
                                 * en este detalle.
                                 *
                                 * Así podemos encontrar:
                                 *
                                 * Frente + Negro
                                 * Frente + Blanco
                                 * Espalda + Negro
                                 * Espalda + Blanco
                                 * etc.
                                 */
                                DisenoPedido diseno = crearDiseno(
                                                producto,
                                                detalle.getColor(),
                                                disenoDTO);

                                detalle.agregarDiseno(
                                                diseno);
                        }
                }

                return detalle;
        }

        // =========================================================
        // CREAR DISEÑO
        // =========================================================

        private DisenoPedido crearDiseno(

                        Producto producto,

                        String colorDetalle,

                        DisenoPedidoDTO dto) {

                if (dto == null) {

                        throw new BadRequestException(
                                        "El diseño no puede ser nulo.");
                }

                if (dto.getRutaImagen() == null ||
                                dto.getRutaImagen().isBlank()) {

                        throw new BadRequestException(
                                        "El diseño debe tener una imagen.");
                }

                if (dto.getPosicion() == null) {

                        throw new BadRequestException(
                                        "El diseño debe indicar su posición.");
                }

                DisenoPedido diseno = new DisenoPedido();

                diseno.setRutaImagen(
                                limpiarTexto(
                                                dto.getRutaImagen()));

                diseno.setRutaMockup(
                                limpiarTexto(
                                                dto.getRutaMockup()));

                diseno.setPosicion(
                                dto.getPosicion()
                                                .name());

                diseno.setTamano(
                                limpiarTexto(
                                                dto.getTamano()));

                diseno.setX(
                                dto.getPosicionX());

                diseno.setY(
                                dto.getPosicionY());

                diseno.setWidth(
                                dto.getAncho());

                diseno.setHeight(
                                dto.getAlto());

                diseno.setAnchoCm(
                                dto.getAnchoCm());

                diseno.setAltoCm(
                                dto.getAltoCm());

                diseno.setObservaciones(
                                limpiarTexto(
                                                dto.getObservaciones()));

                /*
                 * =====================================================
                 * INDUMENTARIA
                 * =====================================================
                 *
                 * Ahora el área se busca por:
                 *
                 * PRODUCTO + POSICIÓN + COLOR
                 *
                 * Ej:
                 *
                 * Remera ID 3
                 * + FRENTE
                 * + Negro
                 *
                 * Si el producto no trabaja con colores,
                 * buscamos el área genérica con color NULL.
                 */
                if (producto instanceof Indumentaria indumentaria) {

                        String colorNormalizado = limpiarTexto(
                                        colorDetalle);

                        AreaPersonalizacion area;

                        // =================================================
                        // PRODUCTO CON COLOR
                        // =================================================

                        if (colorNormalizado != null) {

                                area = areaRepository
                                                .findByIndumentariaIdAndPosicionAndColorIgnoreCase(
                                                                indumentaria.getId(),
                                                                dto.getPosicion(),
                                                                colorNormalizado)
                                                .orElseThrow(() -> new BadRequestException(
                                                                "No existe un área de personalización configurada para "
                                                                                + dto.getPosicion().name()
                                                                                + " en el color "
                                                                                + colorNormalizado
                                                                                + "."));

                        } else {

                                // =============================================
                                // PRODUCTO SIN COLOR / ÁREA GENÉRICA
                                // =============================================

                                area = areaRepository
                                                .findByIndumentariaIdAndPosicionAndColorIsNull(
                                                                indumentaria.getId(),
                                                                dto.getPosicion())
                                                .orElseThrow(() -> new BadRequestException(
                                                                "No existe un área de personalización configurada para "
                                                                                + dto.getPosicion().name()
                                                                                + "."));
                        }

                        // =================================================
                        // VALIDAR QUE EL DISEÑO QUEDE DENTRO DEL ÁREA
                        // =================================================

                        validarDisenoDentroDelArea(
                                        dto,
                                        area);

                        /*
                         * =================================================
                         * SNAPSHOT
                         * =================================================
                         *
                         * Guardamos en el pedido el mockup y el área
                         * tal como estaban en el momento de la compra.
                         *
                         * Esto es importante porque después vos podés
                         * modificar el producto desde Admin sin alterar
                         * pedidos viejos.
                         */

                        diseno.setRutaImagenBase(
                                        area.getImagenMockup());

                        diseno.setAreaX(
                                        area.getX());

                        diseno.setAreaY(
                                        area.getY());

                        diseno.setAreaWidth(
                                        area.getWidth());

                        diseno.setAreaHeight(
                                        area.getHeight());

                        TamanoEstampa tamano = convertirTamano(
                                        dto.getTamano());

                        Double anchoMax = obtenerAnchoMax(
                                        area,
                                        tamano);

                        Double altoMax = obtenerAltoMax(
                                        area,
                                        tamano);

                        diseno.setAreaAnchoMaxCm(
                                        anchoMax);

                        diseno.setAreaAltoMaxCm(
                                        altoMax);

                        validarMedidaReal(
                                        dto,
                                        anchoMax,
                                        altoMax);
                }

                return diseno;
        }

        // =========================================================
        // VALIDACIÓN VISUAL
        // =========================================================

        private void validarDisenoDentroDelArea(

                        DisenoPedidoDTO dto,

                        AreaPersonalizacion area) {

                if (dto.getPosicionX() == null ||
                                dto.getPosicionY() == null ||
                                dto.getAncho() == null ||
                                dto.getAlto() == null) {

                        throw new BadRequestException(
                                        "El diseño debe informar posición y tamaño.");
                }

                double x = dto.getPosicionX();

                double y = dto.getPosicionY();

                double width = dto.getAncho();

                double height = dto.getAlto();

                if (width <= 0 ||
                                height <= 0) {

                        throw new BadRequestException(
                                        "El diseño debe tener un tamaño válido.");
                }

                double margen = 0.01;

                boolean saleIzquierda = x < area.getX() -
                                margen;

                boolean saleArriba = y < area.getY() -
                                margen;

                boolean saleDerecha = x + width > area.getX()
                                + area.getWidth()
                                + margen;

                boolean saleAbajo = y + height > area.getY()
                                + area.getHeight()
                                + margen;

                if (saleIzquierda ||
                                saleArriba ||
                                saleDerecha ||
                                saleAbajo) {

                        throw new BadRequestException(
                                        "El diseño está fuera del área de estampado permitida.");
                }
        }

        // =========================================================
        // MEDIDAS REALES
        // =========================================================

        private void validarMedidaReal(

                        DisenoPedidoDTO dto,

                        Double anchoMax,

                        Double altoMax) {

                if (dto.getAnchoCm() == null ||
                                dto.getAltoCm() == null) {

                        throw new BadRequestException(
                                        "El diseño debe informar sus medidas reales.");
                }

                if (dto.getAnchoCm() <= 0 ||
                                dto.getAltoCm() <= 0) {

                        throw new BadRequestException(
                                        "Las medidas reales del diseño deben ser mayores a cero.");
                }

                if (anchoMax != null &&
                                dto.getAnchoCm() > anchoMax + 0.01) {

                        throw new BadRequestException(
                                        "El diseño supera el ancho máximo permitido.");
                }

                if (altoMax != null &&
                                dto.getAltoCm() > altoMax + 0.01) {

                        throw new BadRequestException(
                                        "El diseño supera el alto máximo permitido.");
                }
        }

        // =========================================================
        // MEDIDAS SEGÚN TAMAÑO
        // =========================================================

        private Double obtenerAnchoMax(

                        AreaPersonalizacion area,

                        TamanoEstampa tamano) {

                if (tamano == null) {

                        return null;
                }

                BigDecimal valor = switch (tamano) {

                        case CHICA ->
                                area.getAnchoChicaCm();

                        case MEDIA ->
                                area.getAnchoMediaCm();

                        case GRANDE ->
                                area.getAnchoGrandeCm();
                };

                return valor != null
                                ? valor.doubleValue()
                                : null;
        }

        private Double obtenerAltoMax(

                        AreaPersonalizacion area,

                        TamanoEstampa tamano) {

                if (tamano == null) {

                        return null;
                }

                BigDecimal valor = switch (tamano) {

                        case CHICA ->
                                area.getAltoChicaCm();

                        case MEDIA ->
                                area.getAltoMediaCm();

                        case GRANDE ->
                                area.getAltoGrandeCm();
                };

                return valor != null
                                ? valor.doubleValue()
                                : null;
        }

        // =========================================================
        // PRECIO BASE
        // =========================================================

        private BigDecimal obtenerPrecioBase(
                        Producto producto) {

                /*
                 * Cartelería precio fijo.
                 */
                if (producto instanceof Carteleria carteleria) {

                        if (carteleria.isEsCotizable()) {

                                throw new BadRequestException(
                                                "Esta cartelería requiere cotización.");
                        }

                        if (carteleria.getPrecioFijo() != null) {

                                return normalizarPrecio(
                                                carteleria.getPrecioFijo());
                        }
                }

                /*
                 * Indumentaria.
                 */
                return normalizarPrecio(
                                producto.getPrecioBase());
        }

        // =========================================================
        // OBTENER TAMAÑO DEL DETALLE
        // =========================================================

        private TamanoEstampa obtenerTamanoEstampa(
                        DetallePedidoDTO detalleDTO) {

                if (detalleDTO.getDisenos() == null ||
                                detalleDTO.getDisenos().isEmpty()) {

                        return null;
                }

                for (DisenoPedidoDTO diseno : detalleDTO.getDisenos()) {

                        if (diseno.getTamano() == null ||
                                        diseno.getTamano().isBlank()) {

                                continue;
                        }

                        return convertirTamano(
                                        diseno.getTamano());
                }

                return null;
        }

        private TamanoEstampa convertirTamano(
                        String valor) {

                if (valor == null ||
                                valor.isBlank()) {

                        return null;
                }

                try {

                        return TamanoEstampa.valueOf(
                                        valor
                                                        .trim()
                                                        .toUpperCase());

                } catch (IllegalArgumentException e) {

                        throw new BadRequestException(
                                        "Tamaño de estampa inválido: "
                                                        + valor
                                                        + ". Valores permitidos: CHICA, MEDIA o GRANDE.");
                }
        }

        // =========================================================
        // PRECIO ESTAMPA
        // =========================================================

        private BigDecimal calcularPrecioEstampa(

                        Producto producto,

                        TamanoEstampa tamano) {

                if (tamano == null) {

                        return BigDecimal.ZERO;
                }

                /*
                 * Cartelería:
                 * no suma estampa.
                 */
                if (producto instanceof Carteleria) {

                        return BigDecimal.ZERO;
                }

                /*
                 * Validamos que el admin tenga ese
                 * tamaño habilitado.
                 */
                if (producto instanceof Indumentaria indumentaria) {

                        switch (tamano) {

                                case CHICA -> {

                                        if (!indumentaria
                                                        .isPermiteEstampaChica()) {

                                                throw new BadRequestException(
                                                                "Este producto no permite estampa chica.");
                                        }
                                }

                                case MEDIA -> {

                                        if (!indumentaria
                                                        .isPermiteEstampaMedia()) {

                                                throw new BadRequestException(
                                                                "Este producto no permite estampa media.");
                                        }
                                }

                                case GRANDE -> {

                                        if (!indumentaria
                                                        .isPermiteEstampaGrande()) {

                                                throw new BadRequestException(
                                                                "Este producto no permite estampa grande.");
                                        }
                                }
                        }
                }

                return switch (tamano) {

                        case CHICA ->
                                normalizarPrecio(
                                                producto
                                                                .getPrecioEstampaChica());

                        case MEDIA ->
                                normalizarPrecio(
                                                producto
                                                                .getPrecioEstampaMedia());

                        case GRANDE ->
                                normalizarPrecio(
                                                producto
                                                                .getPrecioEstampaGrande());
                };
        }

        // =========================================================
        // VALIDAR PRODUCTOS PARA ENVÍO
        // =========================================================

        private void validarProductosParaEnvio(
                        Pedido pedido) {

                if (pedido.getDetalles() == null ||
                                pedido.getDetalles().isEmpty()) {

                        return;
                }

                for (DetallePedido detalle : pedido.getDetalles()) {

                        Producto producto = detalle.getProducto();

                        if (producto == null) {
                                continue;
                        }

                        if (producto instanceof Indumentaria) {
                                continue;
                        }

                        if (producto instanceof Carteleria carteleria) {

                                if (!carteleria.isPermiteEnvio()) {

                                        throw new BadRequestException(
                                                        "El producto \""
                                                                        + producto.getNombre()
                                                                        + "\" no admite envío a domicilio. "
                                                                        + "Seleccioná retiro o quitá este producto.");
                                }
                        }
                }
        }

        // =========================================================
        // VALIDAR DATOS DE ENVÍO
        // =========================================================

        private void validarDatosEnvio(
                        CreatePedidoDTO dto) {

                if (dto.getDireccion() == null ||
                                dto.getDireccion().isBlank()) {

                        throw new BadRequestException(
                                        "La dirección es obligatoria para el envío.");
                }

                if (dto.getCiudad() == null ||
                                dto.getCiudad().isBlank()) {

                        throw new BadRequestException(
                                        "La ciudad es obligatoria para el envío.");
                }

                if (dto.getProvincia() == null ||
                                dto.getProvincia().isBlank()) {

                        throw new BadRequestException(
                                        "La provincia es obligatoria para el envío.");
                }

                if (dto.getCodigoPostal() == null ||
                                dto.getCodigoPostal().isBlank()) {

                        throw new BadRequestException(
                                        "El código postal es obligatorio para el envío.");
                }
        }

        // =========================================================
        // VALIDACIONES
        // =========================================================

        private void validarPedido(
                        CreatePedidoDTO dto) {

                if (dto == null) {

                        throw new BadRequestException(
                                        "El pedido no puede ser nulo.");
                }

                if (dto.getDetalles() == null ||
                                dto.getDetalles().isEmpty()) {

                        throw new BadRequestException(
                                        "El pedido debe tener al menos un producto.");
                }

                if (dto.getNombreCliente() == null ||
                                dto.getNombreCliente().isBlank()) {

                        throw new BadRequestException(
                                        "El nombre del cliente es obligatorio.");
                }

                if (dto.getTelefono() == null ||
                                dto.getTelefono().isBlank()) {

                        throw new BadRequestException(
                                        "El teléfono del cliente es obligatorio.");
                }
        }

        private void validarDetalle(
                        DetallePedidoDTO dto) {

                if (dto == null) {

                        throw new BadRequestException(
                                        "Hay un producto inválido en el carrito.");
                }

                if (dto.getProductoId() == null) {

                        throw new BadRequestException(
                                        "Cada detalle debe tener un producto.");
                }

                if (dto.getCantidad() == null ||
                                dto.getCantidad() <= 0) {

                        throw new BadRequestException(
                                        "La cantidad debe ser mayor a cero.");
                }
        }

        // =========================================================
        // LISTAR PEDIDOS
        // =========================================================

        @Transactional(readOnly = true)
        public List<PedidoResponseDTO> listarPedidos() {

                return pedidoRepository
                                .findAll()
                                .stream()
                                .map(
                                                this::convertirADTO)
                                .toList();
        }

        // =========================================================
        // MIS COMPRAS
        // =========================================================

        @Transactional(readOnly = true)
        public List<PedidoResponseDTO> listarMisCompras(
                        String username) {

                if (username == null ||
                                username.isBlank()) {

                        throw new BadRequestException(
                                        "Usuario no autenticado.");
                }

                return pedidoRepository
                                .findByUsuarioUsernameOrderByFechaPedidoDesc(
                                                username)
                                .stream()
                                .map(
                                                this::convertirADTO)
                                .toList();
        }

        // =========================================================
        // BUSCAR PEDIDO
        // =========================================================

        @Transactional(readOnly = true)
        public PedidoResponseDTO buscarPorId(
                        Long id) {

                Pedido pedido = pedidoRepository
                                .findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Pedido no encontrado"));

                return convertirADTO(
                                pedido);
        }

        // =========================================================
        // PEDIDO -> DTO
        // =========================================================

        private PedidoResponseDTO convertirADTO(
                        Pedido pedido) {

                PedidoResponseDTO dto = new PedidoResponseDTO();

                dto.setId(
                                pedido.getId());

                dto.setNombreCliente(
                                pedido.getNombreCliente());

                dto.setTelefono(
                                pedido.getTelefono());

                dto.setEmail(
                                pedido.getEmail());

                dto.setCiudad(
                                pedido.getCiudad());

                dto.setProvincia(
                                pedido.getProvincia());

                dto.setCodigoPostal(
                                pedido.getCodigoPostal());

                dto.setMetodoEntrega(
                                pedido.getMetodoEntrega());

                dto.setEstadoEnvio(
                                pedido.getEstadoEnvio());

                dto.setSubtotalProductos(
                                pedido.getSubtotalProductos());

                dto.setCostoEnvio(
                                pedido.getCostoEnvio());

                dto.setCodigoSeguimiento(
                                pedido.getCodigoSeguimiento());

                if (pedido.getTarifaEnvio() != null) {

                        dto.setTarifaEnvioId(
                                        pedido.getTarifaEnvio().getId());

                        dto.setTarifaEnvioNombre(
                                        pedido.getTarifaEnvio().getNombre());
                }

                dto.setTotal(
                                pedido.getTotal());

                dto.setEstado(
                                pedido.getEstado());

                dto.setEstadoPago(
                                pedido.getEstadoPago());

                dto.setFechaPedido(
                                pedido.getFechaPedido());

                dto.setDireccion(
                                pedido.getDireccion());

                dto.setMetodoPago(
                                pedido.getMetodoPago());

                dto.setMercadoPagoUrl(
                                pedido.getMercadoPagoUrl());

                dto.setMercadoPagoPreferenceId(
                                pedido.getMercadoPagoPreferenceId());

                dto.setComprobanteTransferencia(
                                pedido.getComprobanteTransferencia());

                List<DetallePedidoResponseDTO> detalles = new ArrayList<>();

                if (pedido.getDetalles() != null) {

                        for (DetallePedido detalle : pedido.getDetalles()) {

                                detalles.add(
                                                convertirDetalleADTO(
                                                                detalle));
                        }
                }

                dto.setDetalles(
                                detalles);

                return dto;
        }

        // =========================================================
        // DETALLE -> DTO
        // =========================================================

        private DetallePedidoResponseDTO convertirDetalleADTO(
                        DetallePedido detalle) {

                DetallePedidoResponseDTO dto = new DetallePedidoResponseDTO();

                dto.setId(
                                detalle.getId());

                if (detalle.getProducto() != null) {

                        dto.setProductoId(
                                        detalle
                                                        .getProducto()
                                                        .getId());

                        dto.setProductoNombre(
                                        detalle
                                                        .getProducto()
                                                        .getNombre());
                }

                dto.setCantidad(
                                detalle.getCantidad());

                dto.setTalle(
                                detalle.getTalle());

                dto.setColor(
                                detalle.getColor());

                if (detalle.getTamanoEstampa() != null) {

                        dto.setTamanoEstampa(
                                        detalle
                                                        .getTamanoEstampa()
                                                        .name());
                }

                dto.setPrecioBase(
                                detalle.getPrecioBase());

                dto.setPrecioEstampa(
                                detalle.getPrecioEstampa());

                dto.setPrecioUnitario(
                                detalle.getPrecioUnitario());

                dto.setSubtotal(
                                detalle.getSubtotal());

                List<DisenoPedidoResponseDTO> disenos = new ArrayList<>();

                if (detalle.getDisenos() != null) {

                        for (DisenoPedido diseno : detalle.getDisenos()) {

                                disenos.add(
                                                convertirDisenoADTO(
                                                                diseno));
                        }
                }

                dto.setDisenos(
                                disenos);

                return dto;
        }

        // =========================================================
        // DISEÑO -> DTO
        // =========================================================

        private DisenoPedidoResponseDTO convertirDisenoADTO(
                        DisenoPedido diseno) {

                DisenoPedidoResponseDTO dto = new DisenoPedidoResponseDTO();

                dto.setId(
                                diseno.getId());

                dto.setRutaImagen(
                                diseno.getRutaImagen());

                dto.setRutaMockup(
                                diseno.getRutaMockup());

                dto.setRutaImagenBase(
                                diseno.getRutaImagenBase());

                dto.setPosicion(
                                diseno.getPosicion());

                dto.setTamano(
                                diseno.getTamano());

                dto.setObservaciones(
                                diseno.getObservaciones());

                dto.setPosicionX(
                                diseno.getX());

                dto.setPosicionY(
                                diseno.getY());

                dto.setAncho(
                                diseno.getWidth());

                dto.setAlto(
                                diseno.getHeight());

                dto.setAnchoCm(
                                diseno.getAnchoCm());

                dto.setAltoCm(
                                diseno.getAltoCm());

                dto.setAreaX(
                                diseno.getAreaX());

                dto.setAreaY(
                                diseno.getAreaY());

                dto.setAreaWidth(
                                diseno.getAreaWidth());

                dto.setAreaHeight(
                                diseno.getAreaHeight());

                dto.setAreaAnchoMaxCm(
                                diseno.getAreaAnchoMaxCm());

                dto.setAreaAltoMaxCm(
                                diseno.getAreaAltoMaxCm());

                return dto;
        }

        // =========================================================
        // UTILIDADES
        // =========================================================

        private BigDecimal normalizarPrecio(
                        BigDecimal precio) {

                if (precio == null) {

                        return BigDecimal.ZERO;
                }

                if (precio.compareTo(
                                BigDecimal.ZERO) < 0) {

                        throw new BadRequestException(
                                        "El precio de un producto no puede ser negativo.");
                }

                return precio;
        }

        private String limpiarTexto(
                        String valor) {

                if (valor == null) {

                        return null;
                }

                String limpio = valor.trim();

                return limpio.isEmpty()
                                ? null
                                : limpio;
        }
}
package com.grenlus.backend.DTO;

import java.math.BigDecimal;
import java.util.Map;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CalibracionEstampaDTO {

    private Double punto1X;

    private Double punto1Y;

    private Double punto2X;

    private Double punto2Y;

    private Map<String, BigDecimal> medidasCmPorTalle;
}

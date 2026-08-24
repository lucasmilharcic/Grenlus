package com.grenlus.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.grenlus.backend.Entity.DisenoSolicitud;

@Repository
public interface DisenoSolicitudRepository extends JpaRepository<DisenoSolicitud, Long> {

}

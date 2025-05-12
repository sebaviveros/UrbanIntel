import { Component, OnInit } from '@angular/core';
import { Config } from 'datatables.net';
import { UsuarioService } from '../../services/usuarioService/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-gestion-cuentas',
  templateUrl: './gestion-cuentas.component.html',
  styleUrl: './gestion-cuentas.component.scss'
})
export class GestionCuentasComponent implements OnInit {
  usuarios: Usuario[] = [];
  dtOptions: Config = {};
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(private usuarioService: UsuarioService) {}
    

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    };
     this.obtenerUsuarios();
  }

  obtenerUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        console.log('Usuarios obtenidos:', this.usuarios);
        // Refrescar la tabla al recibir los datos
        this.dtTrigger.next(null);

      },
      error: (err) => {
        console.error('Error al obtener usuarios:', err);
      }
    });
  }

  editarUsuario() {

  }

  eliminarUsuario() {

  }
}

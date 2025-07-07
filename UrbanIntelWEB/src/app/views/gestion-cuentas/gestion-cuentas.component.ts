import { Component, OnInit, OnDestroy } from '@angular/core';
import { Config } from 'datatables.net';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

import { UsuarioService } from '../../services/usuarioService/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { UsuarioPwDto } from '../../models/Dto/usuarioPwDto';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/authService/auth.service';

@Component({
  selector: 'app-gestion-cuentas',
  templateUrl: './gestion-cuentas.component.html',
  styleUrl: './gestion-cuentas.component.scss'
})
export class GestionCuentasComponent implements OnInit, OnDestroy {

  usuarios: Usuario[] = [];
  dtOptions: Config = {};
  dtTrigger: Subject<any> = new Subject<any>();

  mostrarModal: boolean = false;
  mostrarPassword: boolean = false;
  modoEdicion: boolean = false;
  usuarioActual: any;

  // Variables para crear y editar usuarios
  usuarioDto: UsuarioPwDto = {
    rut: '', nombre: '', apellido: '', email: '', telefono: '',
    direccion: '', password: '', rol: ''
  };

  usuario: Usuario = {
    id: 0, rut: '', nombre: '', apellido: '', email: '', telefono: '',
    direccion: '', rol: ''
  };

  rutUsuarioLogeado: any;

  constructor(private usuarioService: UsuarioService, private authService: AuthService) {}

  ngOnInit(): void {
    const that = this;

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.usuarioService.obtenerUsuarios().subscribe({
          next: (data) => {
            this.usuarios = data;
            callback({ data });
          },
          error: (err) => {
            console.error('Error al obtener usuarios:', err);
            Swal.fire('Error', 'No se pudo cargar la lista de usuarios.', 'error');
          }
        });
      },
      columns: [
        { data: 'id', title: 'ID' },
        { data: 'rut', title: 'RUT' },
        { data: 'nombre', title: 'Nombre' },
        { data: 'apellido', title: 'Apellido' },
        { data: 'email', title: 'E-Mail' },
        { data: 'telefono', title: 'Teléfono' },
        { data: 'direccion', title: 'Dirección' },
        { data: 'rol', title: 'Rol' },
        {
          data: null,
          title: 'Acciones',
          orderable: false,
          render: (data: any) => `
            <button class="btn btn-warning btn-sm me-1 edit-btn" data-rut="${data.rut}">Editar</button>
            <button class="btn btn-danger btn-sm delete-btn" data-rut="${data.rut}">Eliminar</button>
          `
        }
      ],
      rowCallback: (row: Node, data: any) => {
        $('button.edit-btn', row).off('click').on('click', () => {
          that.abrirModal(false, data.rut);
        });
        $('button.delete-btn', row).off('click').on('click', () => {
          that.eliminarUsuario(data.rut);
        });
        return row;
      }
    };
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  abrirModal(nuevo: boolean = true, rut?: string): void {
    this.modoEdicion = !nuevo;
    this.mostrarModal = true;

    if (nuevo) {
      this.usuarioDto = {
        rut: '', nombre: '', apellido: '', email: '', telefono: '',
        direccion: '', password: '', rol: ''
      };
      this.usuarioActual = this.usuarioDto;
    } else if (rut) {
      const usuario = this.usuarios.find(u => u.rut === rut);
      if (usuario) {
        this.usuario = { ...usuario };
        this.usuarioActual = this.usuario;
      }
    }
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.modoEdicion = false;
  }

  guardarUsuario(): void {
    if (this.modoEdicion) {
      this.usuarioService.modificarUsuario({rutUsuarioLogeado: this.authService.getRutUsuario()!,usuarioModificado: this.usuario}).subscribe({
          next: (response) => {
          if (response.success) {
            Swal.fire('Usuario Actualizado', response.message, 'success');
            this.cerrarModal();
            $('#DataTables_Table_1').DataTable().ajax.reload();
          } else {
            Swal.fire('Error', response.message, 'error');
          }
        },
        error: (err) => {
          console.error('Error al modificar usuario:', err);
          const errorMessage = err.error?.message || 'No se pudo modificar el usuario.';
          Swal.fire('Error', errorMessage, 'error');
        }
      });
    } else {
      this.rutUsuarioLogeado = this.authService.getRutUsuario();
      this.usuarioService.crearUsuario(this.usuarioDto,this.rutUsuarioLogeado).subscribe({
        next: (response) => {
          if (response.success) {
            Swal.fire('Usuario Creado', response.message, 'success');
            this.cerrarModal();
            $('#DataTables_Table_1').DataTable().ajax.reload();
          } else {
            Swal.fire('Error', response.message, 'error');
          }
        },
        error: (err) => {
          console.error('Error al crear usuario:', err);
          const errorMessage = err.error?.message || 'No se pudo crear el usuario.';
          Swal.fire('Error', errorMessage, 'error');
        }
      });
    }
  }

  eliminarUsuario(rut: string): void {
    Swal.fire({
      title: `¿Está seguro de eliminar el usuario con RUT ${rut}?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.rutUsuarioLogeado = this.authService.getRutUsuario();
        this.usuarioService.eliminarUsuario(rut, this.rutUsuarioLogeado).subscribe({
          next: (response) => {
            if (response.success) {
              Swal.fire('Usuario Eliminado', response.message, 'success');
              $('#DataTables_Table_1').DataTable().ajax.reload();
            } else {
              Swal.fire('Error', response.message, 'error');
            }
          },
          error: (err) => {
            console.error('Error al eliminar usuario:', err);
            const errorMessage = err.error?.message || 'Error al eliminar el usuario.';
            Swal.fire('Error', errorMessage, 'error');
          }
        });
      }
    });
  }

  togglePasswordVisibility(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

}

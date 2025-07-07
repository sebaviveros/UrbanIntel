import { Usuario } from "../usuario.model";

export interface ModificarUsuarioDto {
  rutUsuarioLogeado: string;
  usuarioModificado: Usuario;
}

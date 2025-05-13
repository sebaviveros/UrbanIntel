export class UsuarioPwDto {
  constructor(
    public rut: string,
    public nombre: string,
    public apellido: string,
    public email: string,
    public telefono: string,
    public direccion: string,
    public rol: string,
    public password: string
  ) {}
}

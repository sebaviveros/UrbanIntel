export class Usuario {
  constructor(
    public id: number,
    public rut: string,
    public nombre: string,
    public apellido: string,
    public email: string,
    public telefono: string,
    public direccion: string,
    public rol: string
  ) {}
}

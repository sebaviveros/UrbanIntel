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

  // Método para obtener el nombre completo
  getNombreCompleto(): string {
    return `${this.nombre} (${this.apellido})`;
  }

  // Método para validar el email
  esEmailValido(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }
}

import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { EventoService, Evento } from '../../services/eventoService/evento.service';
import { AuthService } from '../../services/authService/auth.service';

interface EventItem {
  id?:number;
  title: string;
  time: string;
}

interface CalendarEvent {
  day: number;
  month: number;
  year: number;
  events: EventItem[];
}

@Component({
  selector: 'app-programacion',
  templateUrl: './programacion.component.html',
  styleUrls: ['./programacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProgramacionComponent implements OnInit, AfterViewInit {
  @ViewChild('calendar') calendar!: ElementRef;
  @ViewChild('date') date!: ElementRef;
  @ViewChild('daysContainer') daysContainer!: ElementRef;
  @ViewChild('prev') prev!: ElementRef;
  @ViewChild('next') next!: ElementRef;
  @ViewChild('todayBtn') todayBtn!: ElementRef;
  @ViewChild('gotoBtn') gotoBtn!: ElementRef;
  @ViewChild('dateInput') dateInput!: ElementRef;
  @ViewChild('eventsContainer') eventsContainer!: ElementRef;
  @ViewChild('addEventBtn') addEventBtn!: ElementRef;
  @ViewChild('addEventWrapper') addEventWrapper!: ElementRef;
  @ViewChild('addEventCloseBtn') addEventCloseBtn!: ElementRef;
  @ViewChild('addEventTitle') addEventTitle!: ElementRef;
  @ViewChild('addEventFrom') addEventFrom!: ElementRef;
  @ViewChild('addEventTo') addEventTo!: ElementRef;
  @ViewChild('addEventSubmit') addEventSubmit!: ElementRef;

  today: Date = new Date();
  month: number = this.today.getMonth();
  year: number = this.today.getFullYear();
  activeDay: number = this.today.getDate();
  currentDayName: string = '';

  months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  eventsArr: CalendarEvent[] = [];

  constructor(
    private renderer: Renderer2,
    private eventoService: EventoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getEventsFromBackend(); 
    const rut =  this.authService.getRutUsuario();
    console.log('rut:', rut)
  }

  ngAfterViewInit(): void {
    this.setupCalendarListeners();
    this.setupInputFormatters();
  }

  getEventsFromBackend(): void {
    const rut = this.authService.getRutUsuario();
    if (!rut) {
      console.warn('RUT no encontrado en el token.');
      return;
    }

    this.eventoService.obtenerEventos(rut).subscribe((data) => {
      this.eventsArr = [];

      data.forEach((ev) => {
        const inicio = new Date(ev.hora_inicio);
        const termino = new Date(ev.hora_termino ?? ev.hora_inicio);
        const day = inicio.getDate();
        const month = inicio.getMonth() + 1;
        const year = inicio.getFullYear();

        const from = inicio.toTimeString().slice(0, 5);
        const to = termino.toTimeString().slice(0, 5);
        const timeFormatted = `${this.convertTime(from)} - ${this.convertTime(to)}`;

        let dayEvents = this.eventsArr.find(e => e.day === day && e.month === month && e.year === year);
        if (!dayEvents) {
          dayEvents = { day, month, year, events: [] };
          this.eventsArr.push(dayEvents);
        }

        dayEvents.events.push({ id: ev.id_evento,title: ev.nombre_evento, time: timeFormatted });
      });

      this.initCalendar();
      this.setActiveDay(this.activeDay);
    });
  }

  setupCalendarListeners(): void {
    this.initCalendar();
    this.getActiveDay(this.activeDay);
    this.updateEvents(this.activeDay);

    this.renderer.listen(this.prev.nativeElement, 'click', () => this.changeMonth(-1));
    this.renderer.listen(this.next.nativeElement, 'click', () => this.changeMonth(1));
    this.renderer.listen(this.todayBtn.nativeElement, 'click', () => this.resetToToday());
    this.renderer.listen(this.gotoBtn.nativeElement, 'click', () => this.gotoDate());
    this.renderer.listen(this.addEventBtn.nativeElement, 'click', () =>
      this.addEventWrapper.nativeElement.classList.toggle('active')
    );
    this.renderer.listen(this.addEventCloseBtn.nativeElement, 'click', () =>
      this.addEventWrapper.nativeElement.classList.remove('active')
    );
    this.renderer.listen(this.addEventSubmit.nativeElement, 'click', () => this.addEvent());
  }

  changeMonth(delta: number): void {
    this.month += delta;
    if (this.month < 0) {
      this.month = 11;
      this.year--;
    } else if (this.month > 11) {
      this.month = 0;
      this.year++;
    }
    this.initCalendar();
  }

  resetToToday(): void {
    this.today = new Date();
    this.month = this.today.getMonth();
    this.year = this.today.getFullYear();
    this.activeDay = this.today.getDate();
    this.initCalendar();
  }

  gotoDate(): void {
    const inputValue = this.dateInput.nativeElement.value;
    const parts = inputValue.split('/');
    if (parts.length === 2) {
      const inputMonth = +parts[0];
      const inputYear = +parts[1];
      if (inputMonth > 0 && inputMonth <= 12 && parts[1].length === 4) {
        this.month = inputMonth - 1;
        this.year = inputYear;
        this.initCalendar();
        return;
      }
    }
    alert('Fecha inválida. Usa MM/AAAA.');
  }

  initCalendar(): void {
    const firstDay = new Date(this.year, this.month, 1);
    const lastDay = new Date(this.year, this.month + 1, 0);
    const prevLastDay = new Date(this.year, this.month, 0);
    const startDay = (firstDay.getDay() + 6) % 7;
    const prevDays = prevLastDay.getDate();
    const lastDate = lastDay.getDate();
    const nextDays = 6 - lastDay.getDay();

    this.date.nativeElement.innerText = `${this.months[this.month]} ${this.year}`;
    let days = '';

    for (let x = startDay; x > 0; x--) {
      days += `<div class="day prev-date">${prevDays - x + 1}</div>`;
    }

    for (let i = 1; i <= lastDate; i++) {
      const isToday = i === new Date().getDate() &&
        this.year === new Date().getFullYear() &&
        this.month === new Date().getMonth();
      const hasEvent = this.eventsArr.some(event =>
        event.day === i && event.month === this.month + 1 && event.year === this.year
      );
      let className = 'day';
      if (isToday) className += ' today';
      if (i === this.activeDay) className += ' active';
      if (hasEvent) className += ' event';
      days += `<div class="${className}">${i}</div>`;
    }

    for (let j = 1; j <= nextDays; j++) {
      days += `<div class="day next-date">${j}</div>`;
    }

    this.daysContainer.nativeElement.innerHTML = days;
    this.addDayClickEvents();
  }

  addDayClickEvents(): void {
    const dayElements = this.daysContainer.nativeElement.querySelectorAll('.day');
    dayElements.forEach((el: HTMLElement) => {
      this.renderer.listen(el, 'click', () => {
        const day = parseInt(el.textContent?.trim() || '');
        if (el.classList.contains('prev-date')) {
          this.changeMonth(-1);
          setTimeout(() => this.setActiveDay(day), 10);
        } else if (el.classList.contains('next-date')) {
          this.changeMonth(1);
          setTimeout(() => this.setActiveDay(day), 10);
        } else {
          this.setActiveDay(day, el);
        }
      });
    });
  }

  setActiveDay(day: number, element?: HTMLElement): void {
    this.activeDay = day;
    this.getActiveDay(day);
    this.updateEvents(day);

    const allDays = this.daysContainer.nativeElement.querySelectorAll('.day');
    allDays.forEach((d: HTMLElement) => d.classList.remove('active'));
    if (element) element.classList.add('active');
    else {
      const active = [...allDays].find((d: any) => +d.textContent === day && !d.classList.contains('prev-date') && !d.classList.contains('next-date'));
      if (active) active.classList.add('active');
    }
  }

  getActiveDay(day: number): void {
    const dateUTC = new Date(Date.UTC(this.year, this.month, day));
    const dayName = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      timeZone: 'UTC',
    }).format(dateUTC);
    this.currentDayName = this.capitalize(dayName);
  }

 updateEvents(day: number): void {
  const events = this.eventsArr.find(
    (e) => e.day === day && e.month === this.month + 1 && e.year === this.year
  );

  const html = events ? events.events.map((e, i) => `
  <div class="event">
    <div class="title">
      <i class="fas fa-circle"></i>
      <h3 class="event-title">${e.title}</h3>
      <button class="delete-btn" data-index="${i}">X</button>
    </div>
    <div class="event-time">
      <span>${e.time}</span>
    </div>
  </div>
`).join('') : '<div class="no-event"><h3>Sin Eventos</h3></div>';

this.eventsContainer.nativeElement.innerHTML = html;

// 👇 Luego de insertar el HTML, agregamos los listeners
const deleteButtons = this.eventsContainer.nativeElement.querySelectorAll('.delete-btn');
deleteButtons.forEach((btn: HTMLElement) => {
  const index = parseInt(btn.getAttribute('data-index') || '0');
  this.renderer.listen(btn, 'click', () => {
    this.deleteEvent(index);
  });
});
}

  convertTime(time: string): string {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${suffix}`;
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  setupInputFormatters(): void {
    this.renderer.listen(this.dateInput.nativeElement, 'input', (e: any) => {
      let value = e.target.value.replace(/[^0-9/]/g, '');
      if (value.length === 2 && !value.includes('/')) value += '/';
      if (value.length > 7) value = value.slice(0, 7);
      e.target.value = value;
    });

    [this.addEventFrom, this.addEventTo].forEach((elRef) => {
      this.renderer.listen(elRef.nativeElement, 'input', (e: any) => {
        let value = e.target.value.replace(/[^0-9:]/g, '');
        if (value.length === 2) value += ':';
        if (value.length > 5) value = value.slice(0, 5);
        elRef.nativeElement.value = value;
      });
    });
  }

addEvent(): void {
  const title = this.addEventTitle.nativeElement.value.trim();
  const from = this.addEventFrom.nativeElement.value;
  const to = this.addEventTo.nativeElement.value;

  if (!title || !from || !to) {
    alert('Por favor completa todos los campos');
    return;
  }

  const fromParts = from.split(':').map(Number);
  const toParts = to.split(':').map(Number);

  if (
    fromParts.length !== 2 || toParts.length !== 2 ||
    fromParts[0] > 23 || fromParts[1] > 59 ||
    toParts[0] > 23 || toParts[1] > 59
  ) {
    alert('Formato de hora inválido');
    return;
  }

  // Construye fechas con año, mes y día activos
  const horaInicio = new Date(this.year, this.month, this.activeDay, fromParts[0], fromParts[1]);
  const horaTermino = new Date(this.year, this.month, this.activeDay, toParts[0], toParts[1]);

  const rut = this.authService.getRutUsuario();
  if (!rut) {
    alert('No se pudo obtener el RUT del usuario');
    return;
  }

  const nuevoEvento: Evento = {
    nombre_evento: title,
    descripcion: '', // Puedes agregar input si lo deseas
    hora_inicio: horaInicio.toISOString(),
    hora_termino: horaTermino.toISOString(),
    notificacion: false,
    rut_usuario: rut
  };

  // Enviar al backend
  this.eventoService.crearEvento(nuevoEvento).subscribe({
    next: () => {
      // Actualizar la vista del calendario localmente
      const timeRange = `${this.convertTime(from)} - ${this.convertTime(to)}`;
      let existingDay = this.eventsArr.find(
        (e) => e.day === this.activeDay && e.month === this.month + 1 && e.year === this.year
      );

      if (!existingDay) {
        existingDay = {
          day: this.activeDay,
          month: this.month + 1,
          year: this.year,
          events: [],
        };
        this.eventsArr.push(existingDay);
      }

      existingDay.events.push({ title, time: timeRange });

      this.addEventWrapper.nativeElement.classList.remove('active');
      this.addEventTitle.nativeElement.value = '';
      this.addEventFrom.nativeElement.value = '';
      this.addEventTo.nativeElement.value = '';

      this.updateEvents(this.activeDay);

      const activeDayEl = this.daysContainer.nativeElement.querySelector('.day.active');
      if (activeDayEl && !activeDayEl.classList.contains('event')) {
        activeDayEl.classList.add('event');
      }
    },
    error: (err) => {
      console.error('Error al crear evento:', err);
      alert('Hubo un error al crear el evento');
    }
  });
}

deleteEvent(index: number): void {
  const dayEvents = this.eventsArr.find(
    (e) =>
      e.day === this.activeDay &&
      e.month === this.month + 1 &&
      e.year === this.year
  );

  if (!dayEvents) return;

  const evento = dayEvents.events[index];
  if (!evento) return;

  // 🔴 Si tiene ID, lo eliminamos del backend
  if (evento.id) {
    this.eventoService.eliminarEvento(evento.id).subscribe({
      next: () => {
        console.log('Evento eliminado en backend');
      },
      error: (err) => {
        console.error('Error al eliminar evento del backend', err);
      }
    });
  }

  // ⚪ Luego lo quitamos del arreglo local
  dayEvents.events.splice(index, 1);

  if (dayEvents.events.length === 0) {
    const dayEl = this.daysContainer.nativeElement.querySelector('.day.active');
    if (dayEl?.classList.contains('event')) {
      dayEl.classList.remove('event');
    }

    this.eventsArr = this.eventsArr.filter(e => e !== dayEvents);
  }

  this.updateEvents(this.activeDay);
}

}
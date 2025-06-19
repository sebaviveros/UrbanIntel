import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';

interface EventItem {
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
  encapsulation: ViewEncapsulation.None
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
  @ViewChild('eventDay') eventDay!: ElementRef;
  @ViewChild('eventDate') eventDate!: ElementRef;
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
  months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  currentDayName: string = '';
  eventsArr: CalendarEvent[] = [];

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.getEvents();
  }

  ngAfterViewInit(): void {
    this.initCalendar();

    this.getActiveDay(this.activeDay);
    this.updateEvents(this.activeDay);

    this.renderer.listen(this.prev.nativeElement, 'click', () => this.prevMonth());
    this.renderer.listen(this.next.nativeElement, 'click', () => this.nextMonth());
    this.renderer.listen(this.todayBtn.nativeElement, 'click', () => this.resetToToday());
    this.renderer.listen(this.gotoBtn.nativeElement, 'click', () => this.gotoDate());

    this.renderer.listen(this.addEventBtn.nativeElement, 'click', () =>
      this.addEventWrapper.nativeElement.classList.toggle('active')
    );
    this.renderer.listen(this.addEventCloseBtn.nativeElement, 'click', () =>
      this.addEventWrapper.nativeElement.classList.remove('active')
    );
    this.renderer.listen(this.addEventSubmit.nativeElement, 'click', () =>
      this.addEvent()
    );

    this.setupInputFormatters();
  }

  initCalendar(): void {
    const firstDay = new Date(this.year, this.month, 1);
    const lastDay = new Date(this.year, this.month + 1, 0);
    const prevLastDay = new Date(this.year, this.month, 0);
    const prevDays = prevLastDay.getDate();
    const lastDate = lastDay.getDate();
    const startDay = (firstDay.getDay() + 6) % 7;
    const nextDays = 6 - lastDay.getDay();

    this.date.nativeElement.innerText = `${this.months[this.month]} ${this.year}`;

    let days = '';

    for (let x = startDay; x > 0; x--) {
      days += `<div class="day prev-date">${prevDays - x + 1}</div>`;
    }

    for (let i = 1; i <= lastDate; i++) {
      const isToday =
        i === new Date().getDate() &&
        this.year === new Date().getFullYear() &&
        this.month === new Date().getMonth();

      const hasEvent = this.eventsArr.some(
        (event) =>
          event.day === i &&
          event.month === this.month + 1 &&
          event.year === this.year
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
      const dayStr = el.textContent?.trim();
      const selectedDay = dayStr ? parseInt(dayStr) : NaN;

      if (isNaN(selectedDay)) return;

      const isPrev = el.classList.contains('prev-date');
      const isNext = el.classList.contains('next-date');

      if (isPrev) {
        this.month--;
        if (this.month < 0) {
          this.month = 11;
          this.year--;
        }
        this.initCalendar();
        // ⏱ Esperamos a que se regenere el DOM y marcamos el día correcto
        setTimeout(() => this.markActiveDay(selectedDay), 0);
        return;
      }

      if (isNext) {
        this.month++;
        if (this.month > 11) {
          this.month = 0;
          this.year++;
        }
        this.initCalendar();
        setTimeout(() => this.markActiveDay(selectedDay), 0);
        return;
      }

      // Día del mes actual
      this.setActiveDay(el, selectedDay);
    });
  });
}

private setActiveDay(el: HTMLElement, day: number): void {
  this.activeDay = day;
  this.getActiveDay(day);
  this.updateEvents(day);

  const allDays = this.daysContainer.nativeElement.querySelectorAll('.day');
  allDays.forEach((d: HTMLElement) => d.classList.remove('active'));
  el.classList.add('active');
}

private markActiveDay(day: number): void {
  const allDays = this.daysContainer.nativeElement.querySelectorAll('.day');

  allDays.forEach((el: HTMLElement) => {
    const d = parseInt(el.textContent?.trim() || '');
    const isValid =
      !el.classList.contains('prev-date') &&
      !el.classList.contains('next-date') &&
      d === day;

    if (isValid) {
      this.setActiveDay(el, d);
    }
  });
}

private markActiveDayAfterMonthChange(day: number): void {
  const dayElements = this.daysContainer.nativeElement.querySelectorAll('.day');

  dayElements.forEach((el: HTMLElement) => {
    const elDay = el.textContent?.trim();
    const elDayNum = elDay ? parseInt(elDay) : NaN;

    if (
      !isNaN(elDayNum) &&
      elDayNum === day &&
      !el.classList.contains('prev-date') &&
      !el.classList.contains('next-date')
    ) {
      this.activeDay = elDayNum;
      this.getActiveDay(elDayNum);
      this.updateEvents(elDayNum);
      el.classList.add('active');
    }
  });
}

  prevMonth(): void {
    this.month--;
    if (this.month < 0) {
      this.month = 11;
      this.year--;
    }
    this.initCalendar();
  }

  nextMonth(): void {
    this.month++;
    if (this.month > 11) {
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
    alert('Invalid Date');
  }


 getActiveDay(day: number): void {
  this.activeDay = day;

  // Creamos la fecha en UTC para evitar desfasajes por zona horaria
  const dateUTC = new Date(Date.UTC(this.year, this.month, day));

  // Usamos Intl con zona UTC explícita
  const dayName = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    timeZone: 'UTC'
  }).format(dateUTC);

  this.currentDayName = this.capitalize(dayName);
}

capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
  updateEvents(day: number): void {
    const eventData = this.eventsArr.find(
      (e) => e.day === day && e.month === this.month + 1 && e.year === this.year
    );

    let html = '';
    if (eventData) {
      html = eventData.events
        .map(
          (event) => `
        <div class="event">
          <div class="title">
            <i class="fas fa-circle"></i>
            <h3 class="event-title">${event.title}</h3>
          </div>
          <div class="event-time">
            <span>${event.time}</span>
          </div>
        </div>`
        )
        .join('');
    } else {
      html = '<div class="no-event"><h3>Sin Eventos</h3></div>';
    }

    this.eventsContainer.nativeElement.innerHTML = html;
    this.saveEvents();
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

  convertTime(time: string): string {
    const [hoursStr, minutes] = time.split(':');
    const hours = parseInt(hoursStr);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${suffix}`;
  }

  addEvent(): void {
    const title = this.addEventTitle.nativeElement.value.trim();
    const from = this.addEventFrom.nativeElement.value;
    const to = this.addEventTo.nativeElement.value;

    if (!title || !from || !to) {
      alert('Please fill all the fields');
      return;
    }

    const fromParts = from.split(':').map(Number);
    const toParts = to.split(':').map(Number);

    if (
      fromParts.length !== 2 ||
      toParts.length !== 2 ||
      fromParts[0] > 23 ||
      fromParts[1] > 59 ||
      toParts[0] > 23 ||
      toParts[1] > 59
    ) {
      alert('Invalid Time Format');
      return;
    }

    const timeFrom = this.convertTime(from);
    const timeTo = this.convertTime(to);
    const timeRange = `${timeFrom} - ${timeTo}`;

    let existingDay = this.eventsArr.find(
      (e) =>
        e.day === this.activeDay &&
        e.month === this.month + 1 &&
        e.year === this.year
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

    if (existingDay.events.some((e) => e.title === title)) {
      alert('Event already added');
      return;
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
  }

  saveEvents(): void {
    localStorage.setItem('events', JSON.stringify(this.eventsArr));
  }

  getEvents(): void {
    const data = localStorage.getItem('events');
    if (data) {
      this.eventsArr = JSON.parse(data);
    }
  }
}
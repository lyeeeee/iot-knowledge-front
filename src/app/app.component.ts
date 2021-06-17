import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TitleService } from '@delon/theme';
import { VERSION as VERSION_ALAIN } from '@delon/theme';
import { VERSION as VERSION_ZORRO, NzModalService } from 'ng-zorro-antd';
import {TokenService} from "@delon/auth";

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `,
})
export class AppComponent implements OnInit {
  constructor(
    el: ElementRef,
    renderer: Renderer2,
    private router: Router,
    private titleSrv: TitleService,
    private modalSrv: NzModalService,
    private tokenService: TokenService
  ) {
    renderer.setAttribute(el.nativeElement, 'ng-alain-version', VERSION_ALAIN.full);
    renderer.setAttribute(el.nativeElement, 'ng-zorro-version', VERSION_ZORRO.full);
    this.tokenService.clear();
  }

  ngOnInit() {
    this.router.events.pipe(filter(evt => evt instanceof NavigationEnd)).subscribe(() => {
      this.titleSrv.setTitle();
      this.modalSrv.closeAll();
    });
  }
}

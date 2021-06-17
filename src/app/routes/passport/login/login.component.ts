import { SettingsService, _HttpClient } from '@delon/theme';
import {Component, OnDestroy, Inject, Optional, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {NzMessageService, NzModalService, UploadFile} from 'ng-zorro-antd';
import { SocialService, SocialOpenType, ITokenService, DA_SERVICE_TOKEN } from '@delon/auth';
import { ReuseTabService } from '@delon/abc';
import { environment } from '@env/environment';
import { StartupService } from '@core';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [SocialService],
})
export class UserLoginComponent implements OnDestroy{
  form: FormGroup;
  error = '';
  type = 0;

  constructor(
    fb: FormBuilder,
    modalSrv: NzModalService,
    private router: Router,
    private actRouter: ActivatedRoute,
    private settingsService: SettingsService,
    private socialService: SocialService,
    @Optional()
    @Inject(ReuseTabService)
    private reuseTabService: ReuseTabService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private startupSrv: StartupService,
    public http: _HttpClient,
    public msg: NzMessageService,
  ) {
    this.form = fb.group({
      userName: [null, [Validators.required, Validators.minLength(4)]],
      password: [null, Validators.required],
      mobile: [null, [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      captcha: [null, [Validators.required]],
      remember: [true],
    });
    modalSrv.closeAll();
    
    //this.onSSOMessage();
  }

  ngAfterViewInit(): void {
    this.onSSOMessage()
  }

  private onSSOMessage() {
    this.actRouter.queryParams.subscribe((res:any)=>{
      if(res.sso == 'true'){
        this.tokenService.clear();
      }
      window.addEventListener('message', (e: MessageEvent) => {
        if (e.data.type === 'SSO') {
          this.reuseTabService.clear();
          const user = {
            token: e.data.token,
            username: e.data.username,
            email: `${e.data.username}@bupt.edu.cn`,
            avatar: './assets/image/bupt.svg',
            time: +new Date(),
            password: 'admin'
          };
          // 设置用户Token信息
          // this.tokenService.set(user);
          this.settingsService.setUser(user);
          // this.mxGraphAuthService.storeToken(e.data.token);
          // 后端验证token，并将hash写入username--hash的字典中
          // this.http.post(environment.SERVER_URL + 'api/validSSO', {
          this.http.post('http://192.168.1.101:8081/api/validSSO?_allow_anonymous=true', {
            username: e.data.username,
            password: 'admin',
            token: e.data.token,
          }).subscribe((res: any) => {
            this.tokenService.set({token : res.id_token});
            // console.log("hello")
            // window.parent.postMessage({type:'token', token: res.id_token}, '*')
            // 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
            this.startupSrv.load().then(() => {
              // tslint:disable-next-line:no-non-null-assertion
              let url = this.tokenService.referrer!.url || '/';
              if (url.includes('/passport')) url = '/';
              this.router.navigateByUrl(url).then(r => {
              });
            });
          }, (err: any) => {
            this.error = 'SSO单点登录认证不成功！';
          });
        }
      });
      window.parent.postMessage({ type: 'loaded' }, '*');
    })

  }
  

  // #region fields

  get userName() {
    return this.form.controls.userName;
  }
  get password() {
    return this.form.controls.password;
  }
  get mobile() {
    return this.form.controls.mobile;
  }
  get captcha() {
    return this.form.controls.captcha;
  }

  // #endregion

  switch(ret: any) {
    this.type = ret.index;
  }

  // #region get captcha

  count = 0;
  interval$: any;

  getCaptcha() {
    if (this.mobile.invalid) {
      this.mobile.markAsDirty({ onlySelf: true });
      this.mobile.updateValueAndValidity({ onlySelf: true });
      return;
    }
    this.count = 59;
    this.interval$ = setInterval(() => {
      this.count -= 1;
      if (this.count <= 0) clearInterval(this.interval$);
    }, 1000);
  }
  
  

  // #endregion
  fileList: UploadFile[] = [];
  beforeUpload = (file: UploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    return false;
  };

  submit() {
    if (this.fileList == null || this.fileList.length == 0) {
      return
    }
    this.error = '';
    if (this.type === 0) {
      this.userName.markAsDirty();
      this.userName.updateValueAndValidity();
      this.password.markAsDirty();
      this.password.updateValueAndValidity();
      if (this.userName.invalid || this.password.invalid) return;
    } else {
      this.mobile.markAsDirty();
      this.mobile.updateValueAndValidity();
      this.captcha.markAsDirty();
      this.captcha.updateValueAndValidity();
      if (this.mobile.invalid || this.captcha.invalid) return;
    }

    // 默认配置中对所有HTTP请求都会强制 [校验](https://ng-alain.com/auth/getting-started) 用户 Token
    // 然一般来说登录请求不需要校验，因此可以在请求URL加上：`/login?_allow_anonymous=true` 表示不触发用户 Token 校验

      // .post('/login/account?_allow_anonymous=true', {
      const formData = new FormData();
      formData.append('username', this.userName.value);
      formData.append('password',this.password.value);
      this.fileList.forEach((file: any) => {
        formData.append('file', file);
      });
      this.http
      // .post('api/authenticate?_allow_anonymous=true', {
      //   // type: this.type,
      //   username: this.userName.value,
      //   password: this.password.value,
      // })
      .post('api/authenticate?_allow_anonymous=true', formData)
      .subscribe((res: any) => {
        this.fileList = []
        if (res.id_token === '' || res.id_token == null) {
          this.error = '账号密码错误或不存在或认证不通过！';
          return;
        }
        // 清空路由复用信息
        this.reuseTabService.clear();
        // 设置用户Token信息
        this.tokenService.set({token : res.id_token});
        // 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
        this.startupSrv.load().then(() => {
          let url = this.tokenService.referrer!.url || '/';
          if (url.includes('/passport')) url = '/';
          this.router.navigateByUrl(url);
        });
      });
  }

  // #region social

  open(type: string, openType: SocialOpenType = 'href') {
    let url = ``;
    let callback = ``;
    if (environment.production) {
      callback = 'https://ng-alain.github.io/ng-alain/#/callback/' + type;
    } else {
      callback = 'http://192.168.1.101:4200/#/callback/' + type;
    }
    switch (type) {
      case 'auth0':
        url = `//cipchk.auth0.com/login?client=8gcNydIDzGBYxzqV0Vm1CX_RXH-wsWo5&redirect_uri=${decodeURIComponent(
          callback,
        )}`;
        break;
      case 'github':
        url = `//github.com/login/oauth/authorize?client_id=9d6baae4b04a23fcafa2&response_type=code&redirect_uri=${decodeURIComponent(
          callback,
        )}`;
        break;
      case 'weibo':
        url = `https://api.weibo.com/oauth2/authorize?client_id=1239507802&response_type=code&redirect_uri=${decodeURIComponent(
          callback,
        )}`;
        break;
    }
    if (openType === 'window') {
      this.socialService
        .login(url, '/', {
          type: 'window',
        })
        .subscribe(res => {
          if (res) {
            this.settingsService.setUser(res);
            this.router.navigateByUrl('/');
          }
        });
    } else {
      this.socialService.login(url, '/', {
        type: 'href',
      });
    }
  }

  // #endregion

  ngOnDestroy(): void {
    if (this.interval$) clearInterval(this.interval$);
  }
}

import webview from '@ohos.web.webview';
import promptAction from '@ohos.promptAction';

/**
 * 鸿蒙原生 ArkTS 入口组件 (支持 HarmonyOS NEXT API 12+)
 * 内嵌全功能情侣生活记录应用，支持多端数据同步、微信/云端登录桥接与文件上传
 */
@Entry
@Component
struct Index {
  private controller: webview.WebviewController = new webview.WebviewController();
  
  // 云端部署网址或本地静态资源网址
  @State private appUrl: string = 'https://ais-dev-k23oepuroewhqaouogbmfv-357208839505.asia-northeast1.run.app';
  @State private isLoading: boolean = true;
  @State private progress: number = 0;

  build() {
    Stack({ alignContent: Alignment.TopStart }) {
      Web({ src: this.appUrl, controller: this.controller })
        .domStorageAccess(true)
        .fileAccess(true)
        .imageAccess(true)
        .javaScriptAccess(true)
        .onlineImageAccess(true)
        .databaseAccess(true)
        .width('100%')
        .height('100%')
        .onProgressChange((event) => {
          if (event) {
            this.progress = event.newProgress;
            if (this.progress === 100) {
              this.isLoading = false;
            }
          }
        })
        .onErrorReceive((event) => {
          promptAction.showToast({
            message: '网络连接中，请检查网络设置',
            duration: 2000
          });
        })

      // 顶部加载进度条（清新浅粉过渡）
      if (this.isLoading) {
        Progress({ value: this.progress, total: 100, type: ProgressType.Linear })
          .color('#FF5370')
          .width('100%')
          .height(3)
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FFF0F3')
  }
}

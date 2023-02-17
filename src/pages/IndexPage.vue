  <!-- TODO(開発中止)
    解説: 親指シフトを習得するための練習Webアプリ。拗音拡張対応版にする。
    現状: キーをアップしたら表示する
    今後: 表示用キースタックと押されてるキースタックの２つ用意して表示用キースタックは表示すると空にする
    問題: ２キー同時入力で２キー分のアップ出力がされている　例: SDを押して離す なっ/し と２つ入力が入る。
    　　　これを表示用スタックと押されてるキースタックの２つを用意して
    　　　キーアップで表示用スタックを空にすると両方のキーが離されても表示は１回にできる。
    　　　あと拗音拡張用のデータは手がいてるときに随時追加する。
    理由: 必要性に乏しい。yamabukiRで毎日直接入力するほうが習得が早い。利用者はおそらくタイピング初心者ではない。
    　　　どちらかというとこの分野ではキー配列の一覧が求められている。なので開発中止します。
    　　　キー配置一覧はgoogleスプレットシートで作成した後にPDFでexportしてPNG画像にコンバートしています。
    制作者: http://chocomintboy256/

    このソフトウェアはサポートしていませんので再配布には注意してください。
  -->
<template>
  <q-page class="row items-center justify-evenly">
    <!--
    <example-component
      title="Example component"
      active
      :todos="todos"
      :meta="meta"
    ></example-component>
    -->
    <q-img src="親指シフト_拗音拡張配列_20230205.xlsx - Sheet1-1.png"></q-img>

    <div class="q-pa-md" style="max-width: 300px">
      アプリ上でタイピングすると親指シフト入力でテキストが出力されます。
      windows専用で yamabukiR を参考に作っています。
      リロード(Ctrl-R)で入力テキストを削除できます。
    </div>
    <div class="q-pa-md" style="max-width: 300px">
      <!--{{ yamabukiRSettings }}-->
      <q-input v-model="editingNote" filled type="textarea" />
      <div>無変換: {{ shiftLeft }} 変換: {{ shiftRight }}</div>
      <span style="color:red">※やまぶきRは一時停止してください</span>
    </div>
  </q-page>
</template>

<script lang="ts">
import { Todo, Meta } from 'components/models';
import ExampleComponent from 'components/ExampleComponent.vue';
import { defineComponent, ref } from 'vue';
interface KeyEvent extends Event {
  keyCode: number;
  key: string;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const keyList: { [index: string]: any } = {
  codeList: [
    'Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0','Minus','Equal','IntlYen',
    'KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP','BracketLeft', 'BracketRight',
    'KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon','Quote','Backslash',
    'KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash','IntlRo',
  ],
  単: [
    '１,２,３,４,５,６,７,８,９,０,－,＜,＞',
    '。,か,た,こ,さ,ら,ち,く,つ,，,、,゛',
    'う,し,て,け,せ,は,と,き,い,ん,無,無',
    '．,ひ,す,ふ,へ,め,そ,ね,ほ,・,＼',
  ],
  NonConvert: [
    '？,／,～,「,」,［］,＋,（）,●,『』,＝,￣,｜',
    'ぁ,え,り,ゃ,れ,ぱ,ぢ,ぐ,づ,ぴ,無,゜',
    'を,あ,な,ゅ,も,ば,ど,ぎ,ぽ,よ,無,無',
    'ぅ,－,ろ,や,ぃ,ぷ,ぞ,ぺ,ぼ,・,無',
  ],
  Convert: [
    '！,―,…,「」,＊,［,］,（,）,『,』,｛,｝',
    ',が,だ,ご,ざ,よ,に,る,ま,ぇ,無,゜',
    'ヴ,じ,で,げ,ぜ,み,お,の,ょ,っ,無,無',
    '．,び,ず,ぶ,べ,ぬ,ゆ,む,わ,ぉ,無',
  ],
  KeyD: [
    '無,無,無,無,無,無,無,無,無,無,無,無,無',
    '無,無,無,無,無,無,ちょ,くぉ,つぉ,ぴょ,無,無',
    'って,無,無,無,無,みょ,無,きょ,無,無,無,無',
    '無,無,無,無,無,ぬぉ,無,無,無,無,無',
  ],
  KeyS: [
    '無,無,無,無,無,無,無,無,無,無,無,無,無',
    '無,無,無,無,無,無,にょ,無,づぉ,無,無,無',
    'あっ,無,なっ,無,無,無,無,ぎょ,無,無,無,無',
    '無,無,無,無,無,無,無,無,無,無,無',
  ],
};
const downKeys: string[] = [];
export default defineComponent({
  name: 'IndexPage',
  //components: { ExampleComponent },
  data: () => ({
    KEYCODE_MUHENKAN: 'NonConvert',
    KEYCODE_HENKAN: 'Convert',
    editingNote: '',
    shiftLeft: false,
    shiftRight: false,
    keyList: keyList,
    oldkey: '',         // 二重入力防止
    downKeys: downKeys,
  }),
  methods: {
    getDispString(ind, keyCode, keyCodeList) {
      if (keyCodeList == undefined) return ''
      var v = (keyCodeList.join(',').split(','))[ind]
      return v == '無' ? '' : v
    },
    refreshNote(event: KeyEvent) {
      // this.editingNote = `keyCode: ${event.code} / 無変換: ${this.shiftLeft} / 変換: ${this.shiftRight}`;
      if (
        this.shiftLeft &&
        this.shiftRight
       )
        return;

      var list:string[];
      var code:string;
      var keyCode:string;
      var str = '';
      var ind:number;
      if (this.downKeys.some((v) => {return v == 'Convert'})) {
        list = this.downKeys.filter((v) => {return v != 'Convert'})
        if (list.length == 0)
          str = ''
        else {
          code = list[0]
          ind = this.keyList.codeList.findIndex((v)=>{return v == code})
          str = (this.keyList['Convert'].join(',').split(','))[ind]
        }
      } else if (this.downKeys.some((v) => {return v == 'NonConvert'})) {
        list = this.downKeys.filter((v) => {return v != 'NonConvert'})
        if (list.length == 0)
          str = ''
        else {
          code = list[0]
          ind = this.keyList.codeList.findIndex((v)=>{return v == code})
          str = (this.keyList['NonConvert'].join(',').split(','))[ind]
        }
      } else if (this.downKeys.length > 1) {
        var data = this.downKeys.map((keyCode) => {
          var ind = this.keyList.codeList.findIndex((v)=>{return v == keyCode})
          var keyCodeList = this.keyList[keyCode]
          return { keyCode: keyCode, ind: ind, keyCodeList }
        })
        str += this.getDispString(data[0]['ind'], data[0]['keyCode'], data[1]['keyCodeList'])
        str += this.getDispString(data[1]['ind'], data[1]['keyCode'], data[0]['keyCodeList'])
      } else if (this.downKeys.length == 1) {
        list = this.downKeys
        code = list[0]
        ind = this.keyList.codeList.findIndex((v)=>{return v == code})
        str = (this.keyList['単'].join(',').split(','))[ind]
      } else if (this.downKeys.length == 0) {
        str = ''
      }
      const aa = `${str}`
      this.editingNote += aa;
    },
    keyupRefresh(event: KeyEvent) {
      this.downKeys = this.downKeys.filter((v) => {
        return v != event.code;
      });
    },
    keyup(event: KeyEvent) {
      if (this.oldkey == event.code) this.oldkey = '';
      if (event.code == this.KEYCODE_HENKAN) {
          this.shiftRight = false;
          this.keyupRefresh(event);
      } else if (event.code == this.KEYCODE_MUHENKAN) {
          this.shiftLeft = false;
          this.keyupRefresh(event);
      } else {
          this.refreshNote(event);
          this.keyupRefresh(event);
      }
    },
    keydown(event: KeyEvent) {
      if (this.oldkey == event.code) return;
      if (['Escape','Backquote','CapsLock','Space',
            'Backspace','Enter','ShiftLeft','ControlLeft',
            'AltLeft','ShiftRight','ControlRight','AltRight'].some((v) => {return v == event.code})) return;
      if (event.code == this.KEYCODE_HENKAN) this.shiftRight = true;
      else if (event.code == this.KEYCODE_MUHENKAN) this.shiftLeft = true;
      this.downKeys.push(event.code);
      this.oldkey = event.code;
      //this.refreshNote(event);
    },
  },
  mounted() {
    document.addEventListener('keydown', this.keydown);
    document.addEventListener('keyup', this.keyup);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.keydown);
    document.removeEventListener('keyup', this.keyup);
  },
  setup() {
    // const yamabukiRSettings = myAPI.doAThing().split('\r\n');
    // .filter((x) => {
    //  return x != '';
    // });
    const todos = ref<Todo[]>([
      {
        id: 1,
        content: 'ct1',
      },
      {
        id: 2,
        content: 'ct2',
      },
      {
        id: 3,
        content: 'ct3',
      },
      {
        id: 4,
        content: 'ct4',
      },
      {
        id: 5,
        content: 'ct5',
      },
    ]);
    const meta = ref<Meta>({
      totalCount: 1200,
    });
    // return { todos, meta, yamabukiRSettings, text: ref('') };
    return { todos, meta, text: ref('') };
  },
});
</script>

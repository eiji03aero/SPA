/*
* spa.chat.js
* SPAのチャット機能モジュール
*/

/* jslint browser: true, continue: true,
devel: true, indent: 2, maxerr: 50,
newcap: true, nomen: true, plusplus: true,
regexp: true, sloppy: true, vars: false,
white: true
*/

/*global $, spa*/

spa.chat = (function() {
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------

  var
    configMap = {
      main_html: String()
        + '<div class="spa-chat">'
          + '<div class="spa-chat-head">'
            + '<div class="spa-chat-head-toggle">+</div>'
            + '<div class="spa-chat-head-title">'
              + 'Chat'
            + '</div>'
            + '<div class="spa-chat-closer">x</div>'
            + '<div class="spa-chat-sizer">'
              + '<div class="spa-chat-msgs"></div>'
              + '<div class="spa-chat-box">'
              + '<input type="text"/>'
              + '<div>send</div>'
            + '</div>'
          + '</div>'
        + '</div>',

      settable_map: {
        slider_open_time: true,
        slider_close_time: true,
        slider_opened_em: true,
        slider_closed_em: true,
        slider_opened_title: true,
        slider_closed_title: true,

        chat_model: true,
        people_model: true,
        set_chat_anchor: true
      },

      slider_open_time: 250,
      slider_close_time: 250,
      slider_opened_em: 18,
      slider_closed_em: 2,
      slider_opened_min_em: 10,
      window_height_min_em: 20,
      slider_opened_title: 'Click to close',
      slider_closed_title: 'Click to open',

      chat_model: null,
      people_model: null,
      set_chat_anchor: null
    },

    stateMap = {
      $append_target: null,
      position_type: 'closed',
      px_per_em: 0,
      slider_hidden_px: 0,
      slider_closed_px: 0,
      slider_opened_px: 0
    },
    jqueryMap = {},

    setJqueryMap, getEmSize, setPxSizes, setSliderPosition,
    onClickToggle, configModule, initModule,
    removeSlider, handleResize
    ;

  //----------------- END MODULE SCOPE VARIABLES ---------------


  //------------------- BEGIN UTILITY METHODS ------------------
  // Begin utility /name/
  // End utility /name/

  getEmSize = function(elem) {
    return Number(
      getComputedStyle(elem, '').fontSize.match(/\d*\.?\d*/)[0]
    );
  };

  //-------------------- END UTILITY METHODS -------------------


  //-------------------- BEGIN DOM METHODS ---------------------
  // Begin dom method /name/
  // End dom method /name/


  // Begin dom method /setJqueryMap/
  setJqueryMap = function() {
    var
      $append_target = stateMap.$append_target,
      $slider = $append_target.find('.spa-chat');

    jqueryMap = {
      $slider: $slider,
      $head: $slider.find('.spa-chat-head'),
      $toggle: $slider.find('.spa-chat-head-toggle'),
      $title: $slider.find('.spa-chat-head-title'),
      $sizer: $slider.find('.spa-chat-sizer'),
      $msgs: $slider.find('.spa-chat-msgs'),
      $box: $slider.find('.spa-chat-box'),
      $input: $slider.find('.spa-chat-input input[type=text]')
    };
  };
  // End dom method /setJqueryMap/

  // Begin dom method /setPxSizes/
  setPxSizes = function() {
    var px_per_em, window_height_em, opened_height_em;
    px_per_em = getEmSize(jqueryMap.$slider.get(0));
    window_height_em = Math.floor(
      ($(window).height()/px_per_em) + 0.5
    );

    opened_height_em =
      window_height_em > configMap.window_height_min_em
      ? configMap.slider_opened_em
      : configMap.slider_opened_min_em;

    stateMap.px_per_em = px_per_em;
    stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
    stateMap.slider_opened_px = configMap.slider_opened_em * px_per_em;
    jqueryMap.$sizer.css({
      height: (opened_height_em - 2) * px_per_em
    });
  };
  // End dom method /setPxSizes/

  // Begin dom method /setSliderPosition/
  // 用例：spa.chat.setSliderPosition('closed');
  // 目的：チャットスライダーが要求された状態になるようにする
  // 引数：
  // * position_type--enum('closed', 'opened', or 'hidden')
  // * callback--アニメーションの最後のオプションのコールバック
  // このコールバックは単一引数としてスライダーdivを表すjQueryコレクションを受け取る。
  // 動作：
  //   このメソッドはスライダーを要求された位置に移動する。
  //   要求された位置が現在の位置の場合には、何もせずにtrueを返す
  // 戻り値：
  // * true--要求された位置に移動した
  // * false--要求された位置に移動していない
  // 例外発行：なし
  //
  setSliderPosition = function(position_type, callback) {
    var
      height_px, animate_time, slider_title, toggle_text;

    // スライダーがすでに要求された位置にある場合はtrueを返す
    if(stateMap.position_type === position_type) {
      return true;
    }

    // アニメーションパラメータを用意する
    switch (position_type) {
      case 'opened':
        height_px = stateMap.slider_opened_px;
        animate_time = configMap.slider_open_time;
        slider_title = configMap.slider_opened_title;
        toggle_text = '=';
      break;

      case 'hidden':
        height_px = 0;
        animate_time = configMap.slider_open_time;
        slider_title = '';
        toggle_text = '+';
      break;

      case 'closed' :
        height_px    = stateMap.slider_closed_px;
        animate_time = configMap.slider_close_time;
        slider_title = configMap.slider_closed_title;
        toggle_text  = '+';
      break;

      // 未知のposition_typeに対処する
      default: return false;
    }

    // スライダー位置をアニメーションで変更する
    stateMap.position_type = '';
    jqueryMap.$slider.animate(
      {height: height_px},
      animate_time,
      function() {
        jqueryMap.$toggle.prop('title', slider_title);
        jqueryMap.$toggle.text(toggle_text);
        stateMap.position_type = position_type;
        if (callback) {callback(jqueryMap.$slider);}
      }
    );
    return true;
  };
  // End dom method /setSliderPosition/

  //-------------------- END DOM METHODS -----------------------


  //-------------------- BEGIN EVENT HANDLER -------------------
  // Begin event handler /name/
  // End event handler /name/

  onClickToggle = function(event) {
    var set_chat_anchor = configMap.set_chat_anchor;
    if (stateMap.position_type === 'opened') {
      set_chat_anchor('closed');
    }
    else if (stateMap.position_type === 'closed') {
      set_chat_anchor('opened');
    }
    return false;
  };

  //-------------------- END EVENT HANDLER ---------------------


  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin public method /name/
  // End public method /name/

  // Begin public method /configModule/
  // 用例：spa.chat.configModule({slider_open_em: 18});
  // 目的：初期化前にモジュールを構成する
  // 引数：
  // * set_chat_anchor--オープンまたはクローズ状態を示すように
  //   URI安価０を変更するコールバック。このコールバックは要求された状態を
  //   満たせない場合にはfalseを返す。
  // * chat_model--インスタントメッセージングとやり取りするメソッドを
  //   提供するチャットモデルオブジェクト。
  // * people_model--モデルが保持する人々のリストを管理するメソッドを
  //   提供するピープルモデルオブジェクト
  // * slider_*構成。全てオプションのスカラー。
  //   完全なリストはmapConfig.settable_mapを参照。
  //   用例：slider_open_emはem単位のオープン時の高さ
  // 動作：
  //   指定された引数で内部構成データ構造(configMap)を更新する。
  //   その他の動作は行わない。
  // 戻り値：true
  // 例外発行：
  //   受け入れられない引数や欠如した引数では
  //   JavaScriptエラーオブジェクトとスタックトレース
  //
  configModule = function(input_map) {
    spa.util.setConfigMap({
      input_map: input_map,
      settable_map: configMap.settable_map,
      config_map: configMap
    });
    return true;
  } ;
  // End public method /configModule/

  // Begin public method /initModule/
  // 用例：spa.chat.initModule($('#div_id'));
  // 目的：ユーザーに機能を提供するようにチャットに指示する
  // 引数：
  //   * $append_target (例；$('#div_id'))
  //   １つのDOMコンテナを表すjQueryコレクション
  // 動作：
  //   指定されたコンテナにチャットスライダーを付加し、HTMLコンテンツで埋める
  //   そして、要素、イベント、ハンドラを初期化し、ユーザーにチャットルームインターフェースを提供する。
  // 戻り値：成功時にはtrue、失敗時にはfalse
  // 例外発行：なし
  //
  initModule = function ($append_target) {
    $append_target.append(configMap.main_html);
    stateMap.$append_target = $append_target;
    setJqueryMap();
    setPxSizes();

    // チャットスライダーをデフォルトのタイトルと状態で初期化する
    jqueryMap.$toggle.prop('title', configMap.slider_closed_title);
    jqueryMap.$head.click(onClickToggle);
    stateMap.position_type = 'closed';

    return true;
  };
  // End public method /initModule/

  // Begin public method /removeSlider/
  // Purpose:
  //   * delete chatslider related DOM elements
  //   * make it initial state
  //   * delete callback functions and ponters towords other data
  // Arguments: none
  // return: true
  // exception: none
  //
  removeSlider = function() {
  //   initialize and call off conditions
  //   delete DOM container and event bindings
    if (jqueryMap.$slider) {
      jqueryMap.$slider.remove();
      jqueryMap = {};
    }
    stateMap.$append_target = null;
    stateMap.position_type = 'closed';

    // call off the main structures
    configMap.chat_model = null;
    configMap.people_model = null;
    configMap.set_chat_anchor = null;
    return true;
  };
  // End public method /removeSlider/

  // Begin public method /handleResize/
  // Purpose:
  //   in the case of window resize events, provide the appropriate chat height
  // Actions:
  //   if window height or width gets smaller than set up value,
  //   adjust the chat slider size according to shrunk window size
  // Returns: boolean
  //   * false--resize not considered
  //   * true--resize considered
  // Exceptions: none
  //
  handleResize = function() {
    // do nothing if slider doesnt exist
    if (! jqueryMap.$slider) {return false;}

    setPxSizes();
    if (stateMap.position_type==='opened') {
      jqueryMap.$slider.css({height: stateMap.slider_opened_px});
    }
    return true;
  };
  // End public method /handleResize/

  // return public methods
  return {
    setSliderPosition: setSliderPosition,
    configModule: configModule,
    initModule: initModule,
    removeSlider: removeSlider,
    handleResize: handleResize
  };
  //------------------- END PUBLIC METHODS ---------------------
}());

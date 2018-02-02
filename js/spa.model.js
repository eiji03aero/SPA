/*
 * spa.model.js
 * SPAのチャットモデルモジュール
 */


/* jslint browser: true, continue: true,
devel: true, indent: 2, maxerr: 5,
newcap: true, nomen: true, plusplus: true,
regexp: true, sloppy: true, vars: false,
white: true
*/

/*global TAFFY, $, spa*/

spa.model = (function () {
  'use strict';

  //========================================
  // Module variables
  //========================================

  var
    configMap = { anon_id: 'a0' },
    stateMap = {
      anon_user: null,
      cid_serial: 0,
      people_cid_map: {},
      people_db: TAFFY(),
      user :null,
      is_connected: false,
    },

    isFakeData = true,
    personProto, makeCid, clearPeopleDb, completeLogin,
    makePerson, removePerson, people, chat, initModule;

  //========================================
  // Module variables End
  //========================================


  //========================================
  // people Object API
  //========================================
  // people Object can be used through [spa.model.people]
  // people Object handles the collection of [person] object and publishes events related to that.
  // Public method includes following...
  // - get_user(): Returns the current user. If not defined, returns anon user.
  // - get_db(): Returns the sorted collection of TAFFY DB.
  // - get_by_cid( [cid] ): Returns the person Object designated [cid]
  // - login( [user_name] ): Allow the user login with the name given.
  //    The current user Object would reflect the new ID.
  //    If Login succeeded, [spa-login] event will be published.
  // - logout(): Make the current user to anon one.
  //    This method publishes [spa-logout] event.
  //
  // The events this object publishes includes...
  // - spa-login: When login feature succeeds. Refreshed User Object will accompany.
  // - spa-logout: When logout finishes.Provide the previous user Object.
  //
  // person Object represents users.
  // They come with these methods...
  // - get_is_user(): Returns true if the object is current user.
  // - get_is_anon(): Returns fale if the object is anonymous user.
  // 
  // person Object contains the properties following...
  // - cid: client id. The application always defines it, and only in the case where the front is not
  //    synthesized with backend, they would be different from [id].
  // - id: Unique id. If object was not synthesized with backend, it would be empty.
  // - nmae: user's name.
  // - css_map: Map used for representing avatar feature.
  //========================================
  // people Object API End
  //========================================
  personProto = {
    get_is_user : function () {
      return this.cid === stateMap.user.cid;
    },
    get_is_anon : function () {
      return this.cid === stateMap.anon_user.cid;
    }
  };

  makeCid = function () {
    return 'c' + String( stateMap.cid_serial++ );
  };

  clearPeopleDb = function () {
    var user = stateMap.user;
    stateMap.people_db      = TAFFY();
    stateMap.people_cid_map = {};
    if ( user ) {
      stateMap.people_db.insert( user );
      stateMap.people_cid_map[ user.cid ] = user;
    }
  };

  completeLogin = function ( user_list ) {
    var user_map = user_list[ 0 ];
    delete stateMap.people_cid_map[ user_map.cid ];
    stateMap.user.cid     = user_map._id;
    stateMap.user.id      = user_map._id;
    stateMap.user.css_map = user_map.css_map;
    stateMap.people_cid_map[ user_map._id ] = stateMap.user;

    // When we add chat, we should join here
    $.gevent.publish( 'spa-login', [ stateMap.user ] );
  };

  makePerson = function ( person_map ) {
    var person,
      cid     = person_map.cid,
      css_map = person_map.css_map,
      id      = person_map.id,
      name    = person_map.name;

    if ( cid === undefined || ! name ) {
      throw 'client id and name required';
    }

    person         = Object.create( personProto );
    person.cid     = cid;
    person.name    = name;
    person.css_map = css_map;

    if ( id ) { person.id = id; }

    stateMap.people_cid_map[ cid ] = person;

    stateMap.people_db.insert( person );
    return person;
  };

  removePerson = function ( person ) {
    if ( ! person ) { return false; }
    // cannot remove anonymous person
    if ( person.id === configMap.anon_id ) {
      return false;
    }

    stateMap.people_db({ cid : person.cid }).remove();
    if ( person.cid ) {
      delete stateMap.people_cid_map[ person.cid ];
    }
    return true;
  };

  people = (function () {
    var get_by_cid, get_db, get_user, login, logout;

    get_by_cid = function ( cid ) {
      return stateMap.people_cid_map[ cid ];
    };

    get_db = function () { return stateMap.people_db; };

    get_user = function () { return stateMap.user; };

    login = function ( name ) {
      var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

      stateMap.user = makePerson({
        cid     : makeCid(),
        css_map : {top : 25, left : 25, 'background-color':'#8f8'},
        name    : name
      });

      sio.on( 'userupdate', completeLogin );

      sio.emit( 'adduser', {
        cid     : stateMap.user.cid,
        css_map : stateMap.user.css_map,
        name    : stateMap.user.name
      });
    };

    logout = function () {
      var is_removed, user = stateMap.user;
      // when we add chat, we should leave the chatroom here

      is_removed    = removePerson( user );
      stateMap.user = stateMap.anon_user;

      $.gevent.publish( 'spa-logout', [ user ] );
      return is_removed;
    };

    return {
      get_by_cid : get_by_cid,
      get_db     : get_db,
      get_user   : get_user,
      login      : login,
      logout     : logout
    };
  }());

  // chat Object API
  // ========================================
  // chat Object can be used with [spa.model.chat]
  // chat Object provides method and events that handle chat messaging.
  // public methods are as follow
  // - join (): Join chat room. This routine establishes the event publisher for
  //    [spa-listchange], [spa-updatechat] that build chat protocol including
  //    communicating backend server.
  //    Returns [false] when current user is anonymous.
  // - get_chatee(): Returns the user object with whom user is chatting.
  //    If user is not found in list, returns, [null].
  // - set_chatee(): Set the target chatee identified with [person_id].
  //    Returns [null] if user is not found.
  //    Returns [false] if setee is the same user.
  //    Publishes [spa-setchatee] event.
  // - send_msg([msg_text]): Sends chat message to the target user.
  //    Publishes [spa-updatechat] event.
  //    Returns [false] if the target user is null.
  // - update_avatar([update_avtr_map]): Sends backend [update_avtr_map] object.
  //    As a consequence, [spa-listchange] event will be published containing
  //    updated user list and avatar data.
  //    [update_avtr_map] format must be:
  //      { person_id: person_id, css_map: css_map }
  //
  // This Object publishes the events as follow...
  // - spa-setchatee: Will be published when new target user is set.
  //    Provides data formatted as follows...
  //      { old_chatee: old_chatee_person_object,
  //        new_chatee: new_chatee_person_object }
  // - spa-listchange: Published when online userlist changed.
  //    Registerer should acquire the updated data from [people_db]
  // - spa-updatechat: Published when new message is either sent or received.
  //    Data format is as follows...
  //      { dest_id: chatee_id,
  //        dest_name: chatee_name,
  //        sender_id: sender_id,
  //        msg_text: message_content }
  //
  chat = (function () {
    var
      _publish_listchange,
      _update_list, _leave_chat, join_chat;

    // Begin Internal methods
    _update_list = function (arg_list) {
      var i, person_map, make_person_map,
        people_list = arg_list[0];

      clearPeopleDb();

      PERSON:
      for (i = 0; i < people_list.length; i++) {
        person_map = people_list[i];

        if (! person_map.name) { continue PERSON; }

        // If user is identified, update the css_map and skip the rest.
        if (stateMap.user && stateMap.user.id === person_map._id) {
          stateMap.user.css_map = person_map.css_map;
          continue PERSON;
        }

        make_person_map = {
          cid: person_map._id,
          css_map: person_map.css_map,
          id: person_map._id,
          name: person_map.name
        };

        makePerson(make_person_map);
      }

      stateMap.people_db.sort('name');
    };

    _publish_listchange = function (arg_list) {
      _update_list(arg_list);
      $.gevent.publish('spa-listchange', [arg_list]);
    };
    // End Internal methods

    _leave_chat = function () {
      var sio = isFakeData ? spa.fake.mockSio : spa.data.getsio();
      stateMap.is_connected = false;
      if (sio) { sio.emit('leavechat')};
    };

    join_chat = function () {
      var sio;

      if (stateMap.is_connected) { return false; }

      if (stateMap.user.get_is_anon()) {
        console.warn('User must be defined before joining chat');
        return false;
      }

      sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
      sio.on('listchange', _publish_listchange);
      stateMap.is_connected = true;
      return true;
    }

    return {
      _leave: _leave_chat,
      join: join_chat
    };
  }());

  initModule = function () {
    var i, people_list, person_map;

    // initialize anonymous person
    stateMap.anon_user = makePerson({
      cid   : configMap.anon_id,
      id    : configMap.anon_id,
      name  : 'anonymous'
    });
    stateMap.user = stateMap.anon_user;
  };

  return {
    initModule : initModule,
    chat       : chat,
    people     : people
  };
}());

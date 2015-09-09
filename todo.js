(function(){

  var TASK_STATUSES     = ['!Closed', '!Done', '!Rejected', '!Merge ready', '!In Release', '!Test ready'];
  var QA_TASK_STATUSES  = ['!Closed', '!Done', '!Rejected', '!Merge ready', '!In Release'];
  var PM_TASK_STATUSES  = ['!Closed', '!Done', '!Rejected'];
  var SV_TASK_STATUSES  = ['!Closed', '!Done', '!Rejected'];

  var USER_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=((assignee = {login} OR Reviewer = {login}) AND ({statuses})) ORDER BY priority,updated';
  var TASK_LINK = 'https://onetwotripdev.atlassian.net/browse/{key}';
  var STATUS_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) and ({statuses}) ORDER BY priority,updated';
  var team = 'avia';

  if(~document.location.href.indexOf('devops')){
    team = 'devops';
  }else if(~document.location.href.indexOf('pm')){
    team = 'pm';
  }else if(~document.location.href.indexOf('roadmap')){
    team = 'roadmap';
  }


  if(team === 'avia'){
    var AVIATEAM  = ['alexey.sutiagin','ek','fedor.shumov','aleksandr.gladkikh','andrey.ivanov','ivan.hilkov','renat.abdusalamov','anton.ipatov',
                     'Ango','alexander.litvinov','andrey.plotnikov','andrey.iliopulo','alexander.neyasov','Yury.Kocharyan',
                     'konstantin.kalinin','h3x3d','leonid.riaboshtan','valentin.lapchevskiy'];
    var VIEWTEAM  = ['dmitrii.loskutov', 'andrey.lakotko', 'anastasia.oblomova', 'konstantin.zubkov','marina.severyanova'].concat(AVIATEAM);

    var LEADLIMIT = 20;
    var DEVLIMIT  = 7;

    var TASK_REWRITE_RULES = [
      { // without team
        fields : {
          status : ['Code Review', 'Resolved']
        },
        change_fields : {
          login : {
            source_field : 'reviewEngineer',
            source_field_allowed_values : AVIATEAM
          }
        }
      },
      {
        fields : {
          login  : ['ivan.hilkov', 'Ango', 'andrey.iliopulo'],
          status : ['Code Review', 'Resolved']
        },
        change_fields : {
          login : {
            source_field : 'reviewEngineer',
            source_field_allowed_values : AVIATEAM,
            default : 'fedor.shumov'
          }
        }
      },
      {
        fields : {
          login  : ['aleksandr.gladkikh', 'renat.abdusalamov', 'alexander.neyasov', 'Yury.Kocharyan', 'h3x3d', 'valentin.lapchevskiy'],
          status : ['Code Review', 'Resolved']
        },
        change_fields : {
          login : {
            source_field : 'reviewEngineer',
            source_field_allowed_values : AVIATEAM,
            default : 'alexey.sutiagin'
          }
        }
      },
      {
        fields : {
          login  : ['alexander.litvinov'],
          status : ['Code Review', 'Resolved']
        },
        change_fields : {
          login : {
            source_field : 'reviewEngineer',
            source_field_allowed_values : AVIATEAM,
            default : 'leonid.riaboshtan'
          }
        }
      },
      {
        fields : {
          login  : ['andrey.ivanov', 'anton.ipatov', 'andrey.plotnikov'],
          status : ['Code Review', 'Resolved']
        },
        change_fields : {
          login : {
            source_field : 'reviewEngineer',
            source_field_allowed_values : AVIATEAM,
            default : 'ek'
          }
        }
      },
    ];

    var BLOCKS = [
    { login : 'alexey.sutiagin',      title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT },
    { login : 'ek',                   title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT },
    { login : 'fedor.shumov',         title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT },
    { skip : 1, statuses : ['Code Review'], title_link : STATUS_LINK, task_links : TASK_LINK, logins : AVIATEAM, title : 'Code Review' },

    { login : 'renat.abdusalamov',    title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { login : 'andrey.ivanov',        title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { login : 'ivan.hilkov',          title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { projects : ['OTT', 'AH', 'AC', 'PM'], statuses : ['Test ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Test Ready'},

    { login : 'aleksandr.gladkikh',   title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { login : 'anton.ipatov',         title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { login : 'Ango',                 title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { projects : ['OTT', 'AH', 'AC', 'PM'], statuses : ['Merge ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Merge Ready'},

    { login : 'alexander.neyasov',    title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { login : 'andrey.plotnikov',     title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { login : 'andrey.iliopulo',      title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { projects : ['OTT', 'AH', 'AC', 'PM'], types : ['Release'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Release', title_extras : ['status']},

    { login : 'valentin.lapchevskiy', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { skip : 1 },
    { skip : 1 },
    { projects : ['OTT','AC', 'AH'], statuses : ['In Release', 'Merge Failed', 'Contains Bugs'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Release Tasks'},

    { login : 'h3x3d', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { login : 'leonid.riaboshtan',    title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT},
    { skip : 1 },
    { skip : 1 },

    { skip : 1 },
    { login : 'alexander.litvinov',   title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { login : 'konstantin.kalinin',   title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { skip : 1 },

    { skip : 1 },
    { login : 'Yury.Kocharyan',       title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT}
    ];

    var STATUSES_TO_LOAD = ['!Closed', '!Done' , '!Rejected'];
    var OPTIONS = {
      TASK_REWRITE_RULES : TASK_REWRITE_RULES,
      COLUMNS : 4,
      MOBILE_COLUMNS : 1,
      MOBILE_BLOCKS_SORTER : 'project_attribute',
      REVIEWERS : AVIATEAM
    };
  }
  else if(team === 'devops'){
    var VIEWTEAM  = ['melnik', 'eth', 'marina.ilina'];
    var LEADLIMIT = 20;
    var DEVLIMIT  = 10;

    BLOCKS = [
    { login : 'melnik', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT},
    { projects : ['SRV'], statuses : ['Code Review'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Code Review'},

    { login : 'eth', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { projects : ['SRV'], statuses : ['Test ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Test Ready'},

    { login : 'marina.ilina', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { projects : ['SRV'], statuses : ['Merge ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Merge Ready'},

    { skip : 1},
    { projects : ['SRV'], statuses : ['Done'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Done', sort_by : 'updated', limit : 25 },
    ];

    var STATUSES_TO_LOAD = ['!Closed', '!Rejected'];
    var OPTIONS = {
      COLUMNS : 2,
      MOBILE_COLUMNS : 1,
      MOBILE_BLOCKS_SORTER : 'project_attribute'
    };
  }
  else if(team === 'pm'){
    var VIEWTEAM  = ['evgeny.bush', 'rostislav.palchun', 'valentin.kachanov', 'leonid.riaboshtan',
      'nikolay.malikov', 'armen.dzhanumov', 'alexander.bezhan', 'konstantin.zubkov',
      'konstantin.mamonov', 'timur.danilov', 'vadim.kudelko', 'alexey.lyashchenko',
      'sergey.mashkov', 'alexey.sutiagin', 'ek', 'fedor.shumov'];

    var PMLIMIT   = Infinity;

    BLOCKS = [
    { login : 'evgeny.bush',        title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'rostislav.palchun',  title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'timur.danilov',      title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'valentin.kachanov',  title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'alexander.bezhan',   title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'armen.dzhanumov',    title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'leonid.riaboshtan',  title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'nikolay.malikov',    title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'vadim.kudelko',      title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'alexey.lyashchenko', title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'sergey.mashkov',     title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'alexey.sutiagin',    title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'ek',                 title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'fedor.shumov',       title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT}
    ];

    var STATUSES_TO_LOAD = ['!Closed', '!Rejected', '!Done'];
    var OPTIONS = {
      COLUMNS : 2,
      MOBILE_COLUMNS : 1,
      MOBILE_BLOCKS_SORTER: 'project_attribute',
      LOGIN_KEY_FIELDNAME : 'customfield_10201',
      LOGIN_KEY_CONDTIONS : 'PM',
      SHOW_DUEDATE_INSTEAD_TIMESPEND : true
    };
  }
  else if(team === 'roadmap'){
    var VIEWTEAM  = ['mikhail.sokolov', 'konstantin.mamonov', 'timur.usmanov', 'leonid.riaboshtan', 'konstantin.zubkov', 'kim', 'max.karaush'];

    var SVLIMIT   = Infinity;

    BLOCKS = [
    { login : 'mikhail.sokolov',   title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT},
    { login : 'konstantin.mamonov',title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT},
    { login : 'timur.usmanov',     title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT},
    { login : 'leonid.riaboshtan', title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT},
    { login : 'kim',               title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT},
    { login : 'max.karaush',       title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT},
    { login : 'konstantin.zubkov', title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT},
    ];

    var STATUSES_TO_LOAD = ['!Closed', '!Rejected', '!Done'];
    var OPTIONS = {
      COLUMNS : 2,
      MOBILE_COLUMNS : 1,
      MOBILE_BLOCKS_SORTER: 'project_attribute',
      LOGIN_KEY_FIELDNAME : 'customfield_10900', // supervisor
      LOGIN_KEY_CONDTIONS : 'Supervisor',
      SHOW_DUEDATE_INSTEAD_TIMESPEND : true
    };
  }
  else{
    throw 'unknown team:' + team;
  }

  var task_engine = new window.TaskTable(VIEWTEAM, BLOCKS, STATUSES_TO_LOAD, document.getElementById('todo_block'), OPTIONS);
  // MAIN LOOP =>
  (function loadData(){
    task_engine.process(function(){
      setTimeout(loadData, 5.1*60*1000);
    });
  })();
})();


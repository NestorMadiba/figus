// ============================================================
// FIGURITAS SALTA 2026 - Base de datos completa
// 980 figuritas Panini FIFA World Cup 2026
// Estructura: { num, code, pais, bandera, jugador, tipo }
// tipos: 'intro' | 'escudo' | 'foto_equipo' | 'jugador' | 'especial'
// ============================================================

const STICKER_DB = (() => {
  const equipos = [
    // INTRO / ESPECIALES (1-20)
    // FWC = FIFA World Cup intro pages
    { code:'FWC', pais:'FIFA World Cup 2026', bandera:'🏆', nums:[
      {n:1,  j:'Emblema Oficial',    t:'especial'},
      {n:2,  j:'Mascota Oficial',    t:'especial'},
      {n:3,  j:'Trofeo FIFA',        t:'especial'},
      {n:4,  j:'Estadio MetLife',    t:'especial'},
      {n:5,  j:'Estadio AT&T',       t:'especial'},
      {n:6,  j:'Estadio SoFi',       t:'especial'},
      {n:7,  j:'Estadio Azteca',     t:'especial'},
      {n:8,  j:'Estadio Akron',      t:'especial'},
      {n:9,  j:'BC Place Estadio',   t:'especial'},
    ]},

    // GRUPOS - 48 equipos × 20 figuritas = 960 + especiales
    // Código del álbum: número de orden global (10 en adelante por equipo)
    { code:'ARG', pais:'Argentina',    bandera:'🇦🇷', inicio:10 },
    { code:'AUS', pais:'Australia',    bandera:'🇦🇺', inicio:30 },
    { code:'AUT', pais:'Austria',      bandera:'🇦🇹', inicio:50 },
    { code:'BEL', pais:'Bélgica',      bandera:'🇧🇪', inicio:70 },
    { code:'BRA', pais:'Brasil',       bandera:'🇧🇷', inicio:90 },
    { code:'CMR', pais:'Camerún',      bandera:'🇨🇲', inicio:110 },
    { code:'CAN', pais:'Canadá',       bandera:'🇨🇦', inicio:130 },
    { code:'CHI', pais:'Chile',        bandera:'🇨🇱', inicio:150 },
    { code:'CHN', pais:'China',        bandera:'🇨🇳', inicio:170 },
    { code:'COL', pais:'Colombia',     bandera:'🇨🇴', inicio:190 },
    { code:'CRC', pais:'Costa Rica',   bandera:'🇨🇷', inicio:210 },
    { code:'CRO', pais:'Croacia',      bandera:'🇭🇷', inicio:230 },
    { code:'CIV', pais:"Costa de Marfil", bandera:'🇨🇮', inicio:250 },
    { code:'ECU', pais:'Ecuador',      bandera:'🇪🇨', inicio:270 },
    { code:'EGY', pais:'Egipto',       bandera:'🇪🇬', inicio:290 },
    { code:'ENG', pais:'Inglaterra',   bandera:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', inicio:310 },
    { code:'ESP', pais:'España',       bandera:'🇪🇸', inicio:330 },
    { code:'FRA', pais:'Francia',      bandera:'🇫🇷', inicio:350 },
    { code:'GER', pais:'Alemania',     bandera:'🇩🇪', inicio:370 },
    { code:'GHA', pais:'Ghana',        bandera:'🇬🇭', inicio:390 },
    { code:'GRE', pais:'Grecia',       bandera:'🇬🇷', inicio:410 },
    { code:'HUN', pais:'Hungría',      bandera:'🇭🇺', inicio:430 },
    { code:'IRN', pais:'Irán',         bandera:'🇮🇷', inicio:450 },
    { code:'IRQ', pais:'Irak',         bandera:'🇮🇶', inicio:470 },
    { code:'JPN', pais:'Japón',        bandera:'🇯🇵', inicio:490 },
    { code:'KSA', pais:'Arabia Saudita', bandera:'🇸🇦', inicio:510 },
    { code:'MAR', pais:'Marruecos',    bandera:'🇲🇦', inicio:530 },
    { code:'MEX', pais:'México',       bandera:'🇲🇽', inicio:550 },
    { code:'NED', pais:'Países Bajos', bandera:'🇳🇱', inicio:570 },
    { code:'NGA', pais:'Nigeria',      bandera:'🇳🇬', inicio:590 },
    { code:'NZL', pais:'Nueva Zelanda', bandera:'🇳🇿', inicio:610 },
    { code:'PAN', pais:'Panamá',       bandera:'🇵🇦', inicio:630 },
    { code:'PAR', pais:'Paraguay',     bandera:'🇵🇾', inicio:650 },
    { code:'PER', pais:'Perú',         bandera:'🇵🇪', inicio:670 },
    { code:'POR', pais:'Portugal',     bandera:'🇵🇹', inicio:690 },
    { code:'QAT', pais:'Qatar',        bandera:'🇶🇦', inicio:710 },
    { code:'ROU', pais:'Rumanía',      bandera:'🇷🇴', inicio:730 },
    { code:'SEN', pais:'Senegal',      bandera:'🇸🇳', inicio:750 },
    { code:'SRB', pais:'Serbia',       bandera:'🇷🇸', inicio:770 },
    { code:'SUI', pais:'Suiza',        bandera:'🇨🇭', inicio:790 },
    { code:'TUN', pais:'Túnez',        bandera:'🇹🇳', inicio:810 },
    { code:'TUR', pais:'Turquía',      bandera:'🇹🇷', inicio:830 },
    { code:'URU', pais:'Uruguay',      bandera:'🇺🇾', inicio:850 },
    { code:'USA', pais:'Estados Unidos', bandera:'🇺🇸', inicio:870 },
    { code:'UZB', pais:'Uzbekistán',   bandera:'🇺🇿', inicio:890 },
    { code:'VEN', pais:'Venezuela',    bandera:'🇻🇪', inicio:910 },
    { code:'WAL', pais:'Gales',        bandera:'🏴󠁧󠁢󠁷󠁬󠁳󠁿', inicio:930 },
    { code:'ZIM', pais:'Zimbabue',     bandera:'🇿🇼', inicio:950 },
  ];

  // Jugadores conocidos por equipo (los más destacados, resto genérico)
  const jugadoresFamosos = {
    ARG: ['Escudo','Agustín Marchesín','Nicolás Otamendi','Cristian Romero','Marcos Acuña','Nahuel Molina','Leandro Paredes','Rodrigo De Paul','Enzo Fernández','Alexis Mac Allister','Giovani Lo Celso','Lionel Messi','Lautaro Martínez','Julián Álvarez','Ángel Di María','Paulo Dybala','Nicolás González','Foto de Equipo','Thiago Almada','Valentín Carboni'],
    BRA: ['Escudo','Alisson Becker','Marquinhos','Gabriel Magalhães','Alex Telles','Danilo','Bruno Guimarães','Casemiro','Gerson','Lucas Paquetá','Raphinha','Vinicius Jr.','Rodrygo','Neymar Jr.','Gabriel Barbosa','Endrick','Savinho','Foto de Equipo','Gabriel Martinelli','Endrick'],
    ESP: ['Escudo','Unai Simón','Dani Carvajal','Aymeric Laporte','Pau Cubarsí','Marc Cucurella','Rodri','Pedri','Fabián Ruiz','Yamal Lamine','Nico Williams','Álvaro Morata','Ferran Torres','Dani Olmo','Mikel Merino','Foto de Equipo','Gavi','Alejandro Grimaldo','Bryan Gil','Mikel Oyarzabal'],
    FRA: ['Escudo','Mike Maignan','Benjamin Pavard','Dayot Upamecano','William Saliba','Theo Hernández','N\'Golo Kanté','Aurélien Tchouaméni','Antoine Griezmann','Kingsley Coman','Ousmane Dembélé','Kylian Mbappé','Marcus Thuram','Randal Kolo Muani','Bradley Barcola','Foto de Equipo','Eduardo Camavinga','Adrien Rabiot','Jonathan Clauss','Christopher Nkunku'],
    GER: ['Escudo','Manuel Neuer','Joshua Kimmich','Antonio Rüdiger','Jonathan Tah','David Raum','Toni Kroos','Florian Wirtz','Kai Havertz','Leroy Sané','Jamal Musiala','Thomas Müller','Niclas Füllkrug','Serge Gnabry','İlkay Gündoğan','Foto de Equipo','Robert Andrich','Leon Goretzka','Maximilian Mittelstädt','Pascal Groß'],
    ENG: ['Escudo','Jordan Pickford','Trent Alexander-Arnold','John Stones','Harry Maguire','Luke Shaw','Declan Rice','Jude Bellingham','Bukayo Saka','Phil Foden','Marcus Rashford','Harry Kane','Ollie Watkins','Cole Palmer','Eberechi Eze','Foto de Equipo','Kobbie Mainoo','Conor Gallagher','Morgan Rogers','Anthony Gordon'],
    POR: ['Escudo','Diogo Costa','Nuno Mendes','Rúben Dias','Danilo Pereira','João Cancelo','Bernardo Silva','Bruno Fernandes','Vitinha','João Félix','Rafael Leão','Cristiano Ronaldo','Gonçalo Ramos','Diogo Jota','Pedro Neto','Foto de Equipo','Otávio','Rúben Neves','Matheus Nunes','João Neves'],
    NED: ['Escudo','Bart Verbruggen','Denzel Dumfries','Stefan de Vrij','Virgil van Dijk','Nathan Aké','Frenkie de Jong','Teun Koopmeiners','Tijjani Reijnders','Cody Gakpo','Xavi Simons','Memphis Depay','Donyell Malen','Wout Weghorst','Brian Brobbey','Foto de Equipo','Ryan Gravenberch','Mats Wieffer','Davy Klaassen','Steven Berghuis'],
    BEL: ['Escudo','Koen Casteels','Thomas Meunier','Wout Faes','Jan Vertonghen','Arthur Theate','Kevin De Bruyne','Axel Witsel','Amadou Onana','Leandro Trossard','Dodi Lukebakio','Romelu Lukaku','Lois Openda','Johan Bakayoko','Yannick Carrasco','Foto de Equipo','Alexis Saelemaekers','Charles De Ketelaere','Maxim De Cuyper','Arthur Vermeeren'],
    CRO: ['Escudo','Dominik Livaković','Josip Juranović','Dejan Lovren','Joško Gvardiol','Borna Sosa','Luka Modrić','Mateo Kovačić','Marcelo Brozović','Ivan Perišić','Ante Rebić','Andrej Kramarić','Luka Ivanušec','Bruno Petković','Marko Livaja','Foto de Equipo','Lovro Majer','Mario Pašalić','Josip Šutalo','Luka Vušković'],
    URU: ['Escudo','Sergio Rochet','Nahitan Nández','Diego Godín','José María Giménez','Matías Viña','Rodrigo Bentancur','Federico Valverde','Manuel Ugarte','Giorgian De Arrascaeta','Maximiliano Araújo','Luis Suárez','Edinson Cavani','Darwin Núñez','Facundo Pellistri','Foto de Equipo','Nicolás De La Cruz','Mathías Olivera','Santiago Bueno','Ronald Araújo'],
    COL: ['Escudo','Camilo Vargas','Santiago Arias','Davinson Sánchez','Yerry Mina','Johan Mojica','Wilmar Barrios','Mateus Uribe','Juan Fernando Quintero','James Rodríguez','Cuadrado','Falcao','Radamel Falcao','Luis Díaz','Miguel Ángel Borja','Foto de Equipo','Richard Ríos','Jefferson Lerma','Jhon Arias','Jhon Córdoba'],
    MEX: ['Escudo','Guillermo Ochoa','Jorge Sánchez','César Montes','Johan Vásquez','Jesús Gallardo','Carlos Rodríguez','Edson Álvarez','Héctor Herrera','Jesús Manuel Corona','Hirving Lozano','Raúl Jiménez','Henry Martín','Alexis Vega','Santiago Giménez','Foto de Equipo','Roberto Alvarado','Orbelín Pineda','Gilberto Sepúlveda','Julián Araujo'],
    USA: ['Escudo','Matt Freese','Chris Richards','Tim Ream','Mark McKenzie','Alex Freeman','Antonee Robinson','Tyler Adams','Tanner Tessmann','Weston McKennie','Christian Roldan','Timothy Weah','Foto de Equipo','Diego Luna','Malik Tillman','Christian Pulisic','Brenden Aaronson','Ricardo Pepi','Haji Wright','Folarin Balogun','Cade Cowell'],
    JPN: ['Escudo','Shuichi Gonda','Hiroki Sakai','Maya Yoshida','Ko Itakura','Yuto Nagatomo','Wataru Endō','Hidemasa Morita','Junya Ito','Kaoru Mitoma','Ritsu Dōan','Ayase Ueda','Daichi Kamada','Takefusa Kubo','Koji Miyoshi','Foto de Equipo','Takumi Minamino','Sho Sasaki','Yoshiki Kuribayashi','Shogo Taniguchi'],
    MAR: ['Escudo','Yassine Bounou','Achraf Hakimi','Romain Saïss','Nayef Aguerd','Noussair Mazraoui','Sofyan Amrabat','Azzedine Ounahi','Selim Amallah','Hakim Ziyech','Abde Ezzalzouli','Youssef En-Nesyri','Ilias Chair','Anass Zaroury','Zakaria Aboukhlal','Foto de Equipo','Bilal El Khannouss','Badr Benoun','Yahia Attiat-Allah','Tarik Tissoudali'],
    SEN: ['Escudo','Édouard Mendy','Bouna Sarr','Kalidou Koulibaly','Abdou Diallo','Fodé Ballo-Touré','Idrissa Gueye','Pape Gueye','Nampalys Mendy','Ismaïla Sarr','Sadio Mané','Boulaye Dia','Krepin Diatta','Nicolas Jackson','Habib Diallo','Foto de Equipo','Lamine Camara','Pape Matar Sarr','Formose Mendy','Iliman Ndiaye'],
    AUS: ['Escudo','Mathew Ryan','Milos Degenek','Harry Souttar','Kye Rowles','Aziz Behich','Jackson Irvine','Riley McGree','Aaron Mooy','Matt Leckie','Craig Goodwin','Mitchell Duke','Adam Taggart','Awer Mabil','Martin Boyle','Foto de Equipo','Connor Metcalfe','Lewis Miller','Fran Karacic','Jason Cummings'],
    KSA: ['Escudo','Mohammed Al-Owais','Sultan Al-Ghannam','Ali Al-Bulaihi','Abdullah Madu','Yasser Al-Shahrani','Sami Al-Najei','Musab Al-Juwayr','Mohamed Kanno','Saleh Al-Shehri','Riyadh Sharahili','Firas Al-Buraikan','Abdulrahman Al-Aboud','Hattan Bahebri','Hassan Al-Tambakti','Foto de Equipo','Nasser Al-Dawsari','Ali Al-Hassan','Khalid Al-Ghannam','Nawaf Al-Aqidi'],
    CAN: ['Escudo','Milan Borjan','Richie Laryea','Kamal Miller','Steven Vitória','Sam Adekugbe','Atiba Hutchinson','Mark-Anthony Kaye','Jonathan Osorio','Jonathan David','Lucas Cavallini','Cyle Larin','Alphonso Davies','Tajon Buchanan','Junior Hoilett','Foto de Equipo','Ismaël Koné','Derek Cornelius','David Wotherspoon','Liam Millar'],
  };

  // Posiciones genéricas por número dentro del equipo
  const tiposPorSlot = {
    1: 'Escudo ✨',
    2: 'Portero',3:'Defensa',4:'Defensa',5:'Defensa',6:'Defensa',
    7:'Mediocampista',8:'Mediocampista',9:'Mediocampista',10:'Mediocampista',11:'Mediocampista',
    12:'Mediocampista',13:'Foto de Equipo 📸',
    14:'Delantero',15:'Delantero',16:'Delantero',17:'Delantero',18:'Delantero',
    19:'Delantero',20:'Delantero'
  };

  const db = {};

  // Intro stickers
  db[1]={num:1,code:'FWC',pais:'FIFA World Cup 2026',bandera:'🏆',jugador:'Emblema Oficial',tipo:'especial'};
  db[2]={num:2,code:'FWC',pais:'FIFA World Cup 2026',bandera:'🏆',jugador:'Mascota Oficial',tipo:'especial'};
  db[3]={num:3,code:'FWC',pais:'FIFA World Cup 2026',bandera:'🏆',jugador:'Trofeo FIFA',tipo:'especial'};
  db[4]={num:4,code:'FWC',pais:'USA',bandera:'🏆',jugador:'Estadio MetLife (NY)',tipo:'especial'};
  db[5]={num:5,code:'FWC',pais:'USA',bandera:'🏆',jugador:'Estadio AT&T (Dallas)',tipo:'especial'};
  db[6]={num:6,code:'FWC',pais:'USA',bandera:'🏆',jugador:'Estadio SoFi (LA)',tipo:'especial'};
  db[7]={num:7,code:'MEX',bandera:'🇲🇽',jugador:'Estadio Azteca (CDMX)',tipo:'especial',pais:'México'};
  db[8]={num:8,code:'MEX',bandera:'🇲🇽',jugador:'Estadio Akron (Guadalajara)',tipo:'especial',pais:'México'};
  db[9]={num:9,code:'CAN',bandera:'🇨🇦',jugador:'BC Place (Vancouver)',tipo:'especial',pais:'Canadá'};

  // Equipos con jugadores conocidos
  equipos.forEach(eq => {
    if (!eq.inicio) return; // skip intro block ya hecho

    const famosos = jugadoresFamosos[eq.code];
    for (let slot = 1; slot <= 20; slot++) {
      const numGlobal = eq.inicio + slot - 1;
      if (numGlobal > 980) return;

      let jugador, tipo;
      if (famosos) {
        jugador = famosos[slot - 1] || `Jugador ${eq.code}-${slot}`;
        tipo = slot === 1 ? 'escudo' : slot === 13 ? 'foto_equipo' : 'jugador';
      } else {
        jugador = tiposPorSlot[slot] === 'Escudo ✨' ? `Escudo ${eq.pais}` :
                  tiposPorSlot[slot] === 'Foto de Equipo 📸' ? `Foto de Equipo - ${eq.pais}` :
                  `${eq.code}-${slot}`;
        tipo = slot === 1 ? 'escudo' : slot === 13 ? 'foto_equipo' : 'jugador';
      }

      db[numGlobal] = {
        num: numGlobal,
        code: eq.code,
        pais: eq.pais,
        bandera: eq.bandera,
        jugador,
        tipo,
        slot
      };
    }
  });

  // FIFA Museum (últimas figuritas ~970-980)
  const museoJugadores = [
    'Pelé 🇧🇷','Johan Cruyff 🇳🇱','Diego Maradona 🇦🇷','Ronaldo Nazário 🇧🇷',
    'Zinedine Zidane 🇫🇷','Ronaldinho 🇧🇷','Roberto Baggio 🇮🇹','Gerd Müller 🇩🇪',
    'Franz Beckenbauer 🇩🇪','Michel Platini 🇫🇷','Marco van Basten 🇳🇱'
  ];
  museoJugadores.forEach((j, i) => {
    const n = 970 + i;
    if (n <= 980) {
      db[n] = { num: n, code:'MUS', pais:'FIFA Museum', bandera:'🏅', jugador: j, tipo:'especial' };
    }
  });

  return db;
})();

// Función de búsqueda
function getStickerInfo(num) {
  return STICKER_DB[num] || {
    num, code:'???', pais:'Desconocida', bandera:'❓', jugador:`Figurita #${num}`, tipo:'jugador'
  };
}

// Color de fondo por tipo
function getStickerColor(sticker) {
  if (!sticker || sticker.code === '???') return { bg:'#e5e7eb', text:'#6b7280', accent:'#9ca3af' };
  const palettes = {
    ARG:{ bg:'#74ACDF', text:'white', accent:'#F6C90E' },
    BRA:{ bg:'#009B3A', text:'white', accent:'#FEDF00' },
    ESP:{ bg:'#c60b1e', text:'white', accent:'#f1bf00' },
    FRA:{ bg:'#002395', text:'white', accent:'#ED2939' },
    GER:{ bg:'#000000', text:'white', accent:'#DD0000' },
    ENG:{ bg:'#CF091C', text:'white', accent:'white' },
    POR:{ bg:'#006600', text:'white', accent:'#FF0000' },
    NED:{ bg:'#FF4F00', text:'white', accent:'white' },
    BEL:{ bg:'#000000', text:'#FFD700', accent:'#FF0000' },
    CRO:{ bg:'#FF0000', text:'white', accent:'#0000FF' },
    URU:{ bg:'#4FA0E8', text:'white', accent:'#FFFFFF' },
    COL:{ bg:'#FCD116', text:'#003087', accent:'#CE1126' },
    MEX:{ bg:'#006847', text:'white', accent:'#CE1126' },
    USA:{ bg:'#002868', text:'white', accent:'#BF0A30' },
    JPN:{ bg:'#BC002D', text:'white', accent:'white' },
    MAR:{ bg:'#C1272D', text:'white', accent:'#006233' },
    SEN:{ bg:'#00853F', text:'white', accent:'#FDEF42' },
    AUS:{ bg:'#00843D', text:'white', accent:'#FFD700' },
    KSA:{ bg:'#006C35', text:'white', accent:'white' },
    CAN:{ bg:'#FF0000', text:'white', accent:'white' },
    CHI:{ bg:'#D52B1E', text:'white', accent:'#003087' },
    PAN:{ bg:'#003580', text:'white', accent:'#DA121A' },
    PAR:{ bg:'#D52B1E', text:'white', accent:'#002B7F' },
    PER:{ bg:'#D91023', text:'white', accent:'white' },
    ECU:{ bg:'#FFD100', text:'#000080', accent:'#FF0000' },
    FWC:{ bg:'#1a1a2e', text:'#FFD700', accent:'#e94560' },
    MUS:{ bg:'#2c2c54', text:'#FFD700', accent:'#f0c040' },
  };
  return palettes[sticker.code] || { bg:'#2F7FC1', text:'white', accent:'#F6C90E' };
}

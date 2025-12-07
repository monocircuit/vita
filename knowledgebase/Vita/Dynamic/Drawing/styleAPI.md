Aufgaben:

1. Setzten der Standard Config.
2. Verändern von einzelnen Branches/Connections
3. Branches auch Updaten

Funktionen:
- setGlobalConfig: 
  setzt die Globalen Konfigurationen, wie LayerDistance 
  Beispiel: 
  setGlobalConfig({ branchColor: Math.floor(Math.random() * 0xFFFFFF), layerDistance: 30 });
- setBranchStyle 
  setzt die einzelnen Branch Konfigurationen (Basierend auf der ID)
  Beispiel: setBranchStyle("109", { color: 0x00ff00});
- removeBranchStyle
  setzt Branch Style wieder auf Default/Global
- resetStyles
  Auch hier wird wieder die Globalen Konfigurationen für alles angewendet
- subscribeGlobal/subscribeBranch
  Diese Funktionen sind für die [[Subscription]] notwendig. 
  Hier werden die Listener der Listenerliste hinzugefügt, um Änderungen 
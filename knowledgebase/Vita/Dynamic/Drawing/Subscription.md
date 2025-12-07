Um über die [[Drawing API]] einen bestimmten Branch beispielsweise eine Andere Farbe zu geben wurde das Subscription Modell eingeführt. 
Dadurch ist es möglich, einen Einzelnen Teil, oder den Gesamten Branch auf befehl zu verändern, ohne die gesamte Seite neu zu laden.


Beispiel:
1. Branch wird mit [[drawChronicleBranch]]() gezeichnet --> 
   dabei wird ein Listener in der styleApi angeheftet  
2. User ruft in der API setBranchStyle auf -->
   Listener erkennt Änderung 
3. Listener ruft redraw() funktion des jeweiligen Branches auf
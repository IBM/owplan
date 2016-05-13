// Update room – An action that is invoked every few minutes with periodic temperature and humidity readings captured 
// by more than a dozen individual thermometer/hygrometer sensors // connected to Arduino microcontrollers and sent via 
// HTTP over WiFi. The data is stored in Cloudant to form a data set of room history, current conditions, and could also 
// be used to enable prediction of room conditions in the future. 

// TODO: This action is not currently used within the demo bot. Instead, we map the Arduino HTTP requests to the web/room.php service.
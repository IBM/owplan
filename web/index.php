<?php
require('vendor/autoload.php');

$services_json = json_decode(getenv('VCAP_SERVICES'),true);
$env = $services_json['cloudantNoSQLDB'][0]['credentials']; 
$username = $env['username'];
$password = $env['password'];

// Extract the schedule id. If it's not there, we'll just show documentation.
$id = isset($_GET['id']) ? $_GET['id'] : substr($_SERVER['REQUEST_URI'], 1);

if ($id) {
  try {
    $sag = new Sag($username . '.cloudant.com');
    $sag->login($username, $password);
    $sag->setDatabase('tweet');
    $schedule = $sag->get($id)->body->schedule;
  } catch(Exception $e) {
    echo '<p>Database connection error:</p>';
    echo $e->getMessage();
  }
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">
    <meta name="keywords" content="">
    <link rel="icon" href="/ico/owplan.ico">
    <title>OpenWhisk Conference Plan Bot</title>
    <link href="/bootstrap-dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="/bootstrap-dist/css/bootstrap-theme.min.css" rel="stylesheet">
    <link href="/css/button.css" rel="stylesheet">
    <link href="/css/sticky-footer.css" rel="stylesheet">
    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <script src="/bootstrap-dist/js/bootstrap.min.js"></script>
    <script src="/js/jquery.sparkline.min.js"></script>
    <script>
    $(document).ready(function(){
        $('[data-toggle="tooltip"]').tooltip(); 
        // $('[data-toggle="inlinesparkline"]').sparkline(); 
    });
    </script>
  </head>

<body role="document">

  <header class="navbar navbar-static-top" id="top" role="banner">
    <nav class="navbar navbar-inverse navbar-fixed-top">
      <div class="container">
        <div class="navbar-header">
          <a class="navbar-brand" href="/" style="padding-left: 0; font-size: 150%">Conference Plan Bot (OSCON)</a>
        </div>
        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
          <ul class="nav navbar-nav navbar-right">
            <li class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">About <span class="caret"></span></a>
              <ul class="dropdown-menu">
                <li><a href="#">Blog post</a></li>
                <li><a href="#">GitHub</a></li>
                <li><a href="#">OpenWhisk.org</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>

  <div class="container">
    
  <?php if ($id) { ?>

    <ul class="nav nav-tabs">
      <li class="active"><a data-toggle="tab" href="#Monday">Mon</a></li>
      <li><a data-toggle="tab" href="#Tuesday">Tue</a></li>
      <li><a data-toggle="tab" href="#Wednesday">Wed</a></li>
      <li><a data-toggle="tab" href="#Thursday">Thu</a></li>
    </ul>

    <div class="tab-content">

      <?php foreach ($schedule as $day) { ?>
      <div id="<?php echo $day->name ?>" class="tab-pane fade<?php if ($day->name == 'Monday') { ?> in active <?php } ?>">
        <div class="row">
          <div class="panel panel-default">
            <div class="panel-heading text-center"><h5 class="panel-title"><?php echo $day->name ?> <?php echo $day->description ?></h5></div>
            <table class="table table-hover">
              <tbody>
                <?php foreach ($day->schedule as $timeslot) { ?>
                <tr>
                  <td style="padding-left: 15px;" class="col-sm-1"><?php echo $timeslot->timeslot ?></td>
                  <td class="col-sm-6" style="padding-top: 0; padding-bottom: 0;">
                    <table class="table table-hover">
                      <tbody>
                        <?php foreach ($timeslot->sessions as $session) { ?>
                        <?php
                        $confidenceIndicator = 'color: #bbb';
                        if ($session->confidence > 0) $confidenceIndicator = 'color: #3333ff; font-weight: 500; font-size: 100%';
                        if ($session->confidence > 1) $confidenceIndicator = 'color: #0000ff; font-weight: 600; font-size: 105%';
                        if ($session->confidence > 2) $confidenceIndicator = 'color: #0000cc; font-weight: 700; font-size: 110%';
                        if ($session->confidence > 3) $confidenceIndicator = 'color: #000099; font-weight: 800; font-size: 130%';
                        if ($session->confidence > 4) $confidenceIndicator = 'color: #000066; font-weight: 900; font-size: 150%';

                        $noiseIndicator = 'success';
                        if ($session->conditions->decibels > 66) $noiseIndicator = 'warning'; 
                        if ($session->conditions->decibels > 68) $noiseIndicator = 'danger';

                        $heatIndicator = 'success';
                        if ($session->conditions->temperature > 73) $heatIndicator = 'warning'; 
                        if ($session->conditions->temperature > 78) $heatIndicator = 'danger'; 

                        $humidityIndicator = 'success';
                        if ($session->conditions->humidity > 73) $humidityIndicator = 'warning'; 
                        if ($session->conditions->humidity > 78) $humidityIndicator = 'danger'; 
                        ?>
                        <tr>
                          <td class="col-sm-8"><span data-toggle="tooltip" title="<?php echo htmlentities($session->description); ?>" style="<?php echo $confidenceIndicator ?>"><?php echo $session->summary; ?></span></td>
                          <td class="col-sm-2"><?php echo $session->location; ?></td>
                          <td class="text-nowrap col-sm-2 align-right">
                            <?php if ($session->conditions->temperature) { ?>
                              <button type="button" class="btn btn-<?php echo $noiseIndicator ?> btn-circle"><?php echo $session->conditions->decibels; ?><sup>dB</sup></button>
                              <button type="button" class="btn btn-<?php echo $heatIndicator ?> btn-circle"><?php echo $session->conditions->temperature; ?>&deg;</button>
                              <button type="button" class="btn btn-<?php echo $humidityIndicator ?> btn-circle"><?php echo $session->conditions->humidity; ?><sup>%</sup></button>
                              <!-- <span data-toggle="inlinesparkline" class="inlinesparkline">5,6,7,9,9,5,3,2,2,4,6,7</span> -->
                            <?php } else { ?>
                              <button type="button" class="btn btn-default btn-circle">-<sup>dB</sup></button>
                              <button type="button" class="btn btn-default btn-circle">-&deg;</button>
                              <button type="button" class="btn btn-default btn-circle">-<sup>%</sup></button>
                            <?php } ?>
                          </td>
                        </tr> 
                        <?php } ?>
                      </tbody>
                    </table>
                  </td>
                </tr> 
                <?php } ?>
              </tbody>
            </table>
          </div>
        </div>
      </div>      
      <?php } ?>


      </div>

    </div>

    <?php } else { ?>

    <p>The <a href="https://developer.ibm.com/open/">OpenWhisk Conference Plan Bot</a> is a demonstration of a serverless, event-driven bot based on OpenWhisk open source and IBM Bluemix technology.</p>
    <p>Tweet a few keywords on topics you'd like to hear about at OSCON to <a href="https://twitter.com/owplan">@owplan</a>.</p>

    <?php } ?>

</div>

<footer class="footer">
  <div class="container">
    <p class="text-muted">Built on <a href="http://openwhisk.org/">OpenWhisk</a>.</p>
  </div>
</footer>

</body>
</html>


<html>
<body>
	<?php
	echo "access sucess"."<br />";
	mysql_connect('localhost', 'root', '!%($%(');
	mysql_select_db('SE');
	// $list_result = mysql_query('SELECT * FROM stat-power');

	// $power = $_GET['pwr'];
	if($_GET['pwr']==1){
	echo "Power ON"."<br />";
	$result = mysql_query("INSERT INTO `SE`.`stat-power` (`id`, `power`, `time`)  VALUES (NULL,'".mysql_real_escape_string($_GET['pwr'])."', now())");
	
    // header("Location: list.php"); 
	echo "INSERT INTO `SE`.`stat-power` (`id`, `power`, `time`)  VALUES (NULL,'".mysql_real_escape_string($_GET['pwr'])."', now())";
}
else if($_GET['pwr']==0){
echo "Power OFF"."<br />";
	$result = mysql_query("INSERT INTO `SE`.`stat-power` (`id`, `power`, `time`)  VALUES (NULL,'".mysql_real_escape_string($_GET['pwr'])."', now())");
echo "INSERT INTO `SE`.`stat-power` (`id`, `power`, `time`)  VALUES (NULL,'".mysql_real_escape_string($_GET['pwr'])."', now())";
}
else{
	echo "invalid";
}
	echo " "."<br />";
	?>
</body>
</html>
<html>
<body>
	<?php
	echo "access sucess"."<br />";
	mysql_connect('localhost', 'root', '!%($%(');
	mysql_select_db('SE');
	// $sql = "SELECT `id`, `power`, `time` FROM `stat-power` ORDER BY id DESC WHERE 1 LIMIT 1, 10 ";
	$sql = "SELECT `id`, `power`, `time` FROM `stat-power` ORDER BY id DESC LIMIT 1, 10 ";
	$list_result = mysql_query($sql);
	// echo $list_result;
	// echo "nununununu"."<br/>";

	// echo $list_result;
	while($row = mysql_fetch_array($list_result)) {
                        // echo "<li><a href=\"?id={$row['id']}\">".htmlspecialchars($row['id'])."</a></li>";                        
			echo htmlspecialchars($row['power']); 
			echo " / ";
			echo htmlspecialchars($row['time']); 
			echo "<br />";
	}
	// $power = $_GET['pwr'];

	?>
</body>
</html>
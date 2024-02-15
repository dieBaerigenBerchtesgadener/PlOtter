from brachiograph import BrachioGraph

bg = BrachioGraph(
    pw_down=2460,
    pw_up=1950,
    bounds=(-8.5, 4, 4.5, 12),
    servo_1_parked_pw=1490,
    servo_2_parked_pw=1450,
    hysteresis_correction_1=7,
    hysteresis_correction_2=7,
)

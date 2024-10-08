\c yum_stepper_dev;
-- Function to convert steps into points
CREATE OR REPLACE FUNCTION convert_steps_to_points() 
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET points_earned = points_earned + NEW.step_count
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for steps table
CREATE TRIGGER trigger_convert_steps_to_points
AFTER INSERT ON steps
FOR EACH ROW
EXECUTE FUNCTION convert_steps_to_points();


-- Function to calculate check-in points based on distance
CREATE OR REPLACE FUNCTION calculate_checkin_points() 
RETURNS TRIGGER AS $$
DECLARE
    user_lat FLOAT;
    user_long FLOAT;
    restaurant_lat FLOAT;
    restaurant_long FLOAT;
    distance FLOAT;
BEGIN
    SELECT latitude::FLOAT, longitude::FLOAT INTO user_lat, user_long 
    FROM users WHERE id = NEW.user_id;

    SELECT latitude::FLOAT, longitude::FLOAT INTO restaurant_lat, restaurant_long
    FROM restaurants WHERE id = NEW.restaurant_id;

    distance := SQRT(POWER(user_lat - restaurant_lat, 2) + POWER(user_long - restaurant_long, 2));

    IF distance <= 5 THEN
        UPDATE users 
        SET points_earned = points_earned + 10 
        WHERE id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for check-ins table
CREATE TRIGGER trigger_calculate_checkin_points
AFTER INSERT ON checkins
FOR EACH ROW
EXECUTE FUNCTION calculate_checkin_points();
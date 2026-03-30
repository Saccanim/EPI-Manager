-- Função para decrementar estoque com proteção de concorrência
-- Executar no SQL Editor do Supabase após o schema inicial

CREATE OR REPLACE FUNCTION decrement_stock(p_stock_id UUID, p_qty INT)
RETURNS VOID AS $$
BEGIN
  UPDATE stock
  SET quantity = quantity - p_qty,
      updated_at = NOW()
  WHERE id = p_stock_id AND quantity >= p_qty;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Estoque insuficiente para o item %', p_stock_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

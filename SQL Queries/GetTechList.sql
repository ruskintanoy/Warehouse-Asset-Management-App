-- ================================================
-- Template generated from Template Explorer using:
-- Create Procedure (New Menu).SQL
--
-- Use the Specify Values for Template Parameters 
-- command (Ctrl-Shift-M) to fill in the parameter 
-- values below.
--
-- This block of comments will not be included in
-- the definition of the procedure.
-- ================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Ruskin Tanoy
-- Create date: 2026-03-17
-- Description:	Returns the technician and unit list used by the Residential Inventory kiosk app 
-- =============================================
CREATE PROCEDURE GetTechList 
	
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
	select s.stageid, s.stage, s.bponum 
	from stages s join stage_properties sp on s.stageid = sp.stageid join stage_type_properties stp on stp.id = sp.stage_type_property_id
	where stp.name = 'MISC_LIST' AND sp.value > 0.0 order by s.stage
END
GO

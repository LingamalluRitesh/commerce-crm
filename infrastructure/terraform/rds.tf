# PostgreSQL High Availability RDS Database
resource "aws_db_subnet_group" "commercecrm" {
  name       = "commercecrm-db-subnet-group"
  subnet_ids = module.vpc.database_subnets
}

resource "aws_security_group" "rds" {
  name        = "commercecrm-rds-sg"
  description = "Allow inbound PostgreSQL traffic from EKS worker nodes"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "PostgreSQL access from private subnets"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = module.vpc.private_subnets_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "postgres" {
  identifier           = "commercecrm-db-${var.environment}"
  engine               = "postgres"
  engine_version       = "16.1"
  instance_class       = "db.r6g.xlarge"
  allocated_storage    = 100
  max_allocated_storage = 1000
  storage_type         = "gp3"
  storage_encrypted    = true
  multi_az             = var.environment == "production"

  db_name  = "commercecrm_db"
  username = "commercecrm_admin"
  password = var.db_master_password

  db_subnet_group_name   = aws_db_subnet_group.commercecrm.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period   = 30
  backup_window             = "03:00-04:00"
  maintenance_window        = "Mon:04:00-Mon:05:00"
  auto_minor_version_upgrade = true
  deletion_protection       = var.environment == "production"
  skip_final_snapshot       = var.environment != "production"
}

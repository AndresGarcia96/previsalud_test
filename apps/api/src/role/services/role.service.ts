import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  // CREATE FUNTIONS //

  async createRole(role: CreateRoleDto) {
    const rolesFound = await this.roleRepository.findOne({
      where: {
        name: role.name,
      },
    });

    if (rolesFound) {
      throw new HttpException(
        `El role: ${role.name} ya está registrado.`,
        HttpStatus.CONFLICT,
      );
    }

    const newRole = await this.roleRepository.create(role);

    return await this.roleRepository.save(newRole);
  }

  // GET FUNTIONS //

  async getAllRoles() {
    const allRoles = await this.roleRepository.find({
      order: {
        id: 'ASC',
      },
    });

    if (allRoles.length === 0) {
      throw new HttpException(
        `No hay roles registrados en la base de datos`,
        HttpStatus.NOT_FOUND,
      );
    } else {
      return allRoles;
    }
  }

  async getRoleById(id: number) {
    const roleFound = await this.roleRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!roleFound) {
      throw new HttpException(
        `El role con número de ID: ${id} no esta registrado.`,
        HttpStatus.CONFLICT,
      );
    } else {
      return roleFound;
    }
  }

  // UPDATE FUNTIONS //

  async updateRole(id: number, role: UpdateRoleDto) {
    const roleFound = await this.roleRepository.findOneBy({ id });

    if (!roleFound) {
      throw new HttpException(`Role no encontrado.`, HttpStatus.NOT_FOUND);
    }

    if (role.name) {
      const duplicateRole = await this.roleRepository.findOne({
        where: {
          name: role.name,
        },
      });

      if (duplicateRole) {
        throw new HttpException(`Role duplicado.`, HttpStatus.CONFLICT);
      }
    }

    const updateRole = await this.roleRepository.update(id, role);

    if (updateRole.affected === 0) {
      throw new HttpException(`Role no encontrado.`, HttpStatus.NOT_FOUND);
    }

    throw new HttpException(
      `¡Datos guardados correctamente!`,
      HttpStatus.ACCEPTED,
    );
  }
}
